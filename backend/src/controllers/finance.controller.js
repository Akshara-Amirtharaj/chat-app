import Expense from '../models/expense.model.js';
import Settlement from '../models/settlement.model.js';
import Workspace from '../models/workspace.model.js';

// Create expense
export const createExpense = async (req, res) => {
  try {
    const { workspaceId, title, description, amount, currency, paidBy, category, splitType, participants, splits, notes } = req.body;
    const userId = req.user._id;

    console.log('Creating expense:', { workspaceId, title, amount, userId });

    // Verify workspace membership
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      console.error('Workspace not found:', workspaceId);
      return res.status(404).json({ message: 'Workspace not found' });
    }
    // Check if user is owner or member
    const isOwner = workspace.ownerId.toString() === userId.toString();
    const isMember = workspace.members.some(member => 
      member.userId.toString() === userId.toString() && 
      (!member.status || member.status === 'ACTIVE')
    );
    
    if (!isOwner && !isMember) {
      console.error('User not a member:', userId);
      return res.status(403).json({ message: 'You must be a member of this workspace' });
    }

    const expense = new Expense({
      workspaceId,
      title,
      description,
      amount,
      currency: currency || 'USD',
      paidBy: paidBy || userId,
      category: category || 'OTHER',
      splitType: splitType || 'EQUAL',
      notes,
    });

    // Calculate splits
    if (splitType === 'EQUAL') {
      const sharePerPerson = amount / participants.length;
      expense.participants = participants.map(userId => ({
        userId,
        share: sharePerPerson,
        settled: false,
      }));
    } else if (splitType === 'PERCENTAGE') {
      expense.participants = splits.map(split => ({
        userId: split.userId,
        share: (amount * split.percentage) / 100,
        settled: false,
      }));
    } else if (splitType === 'AMOUNT' || splitType === 'CUSTOM') {
      expense.participants = splits.map(split => ({
        userId: split.userId,
        share: split.amount,
        settled: false,
      }));
    }

    await expense.save();

    const populatedExpense = await Expense.findById(expense._id)
      .populate('paidBy', 'fullName email profilePic')
      .populate('participants.userId', 'fullName email profilePic');

    res.status(201).json({
      message: 'Expense created successfully',
      expense: populatedExpense,
    });
  } catch (error) {
    console.error('Error in createExpense:', error.message, error.stack);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

// Get expenses with pagination
export const getExpenses = async (req, res) => {
  try {
    const { workspaceId, cursor, limit = 20 } = req.query;
    const userId = req.user._id;

    console.log('Getting expenses for workspace:', workspaceId, 'user:', userId);

    // Verify workspace membership
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      console.error('Workspace not found:', workspaceId);
      return res.status(404).json({ message: 'Workspace not found' });
    }
    
    // Check if user is owner or member
    const isOwner = workspace.ownerId.toString() === userId.toString();
    const isMember = workspace.members.some(member => 
      member.userId.toString() === userId.toString() && 
      (!member.status || member.status === 'ACTIVE')
    );
    
    console.log('Access check:', { workspaceId, userId, isOwner, isMember });
    
    if (!isOwner && !isMember) {
      console.error('User not authorized:', userId);
      return res.status(403).json({ message: 'Access denied' });
    }

    const query = { workspaceId };
    if (cursor) {
      query._id = { $lt: cursor };
    }

    const expenses = await Expense.find(query)
      .populate('paidBy', 'fullName email profilePic')
      .populate('participants.userId', 'fullName email profilePic')
      .sort({ date: -1, _id: -1 })
      .limit(parseInt(limit));

    const nextCursor = expenses.length > 0 ? expenses[expenses.length - 1]._id : null;

    res.status(200).json({
      expenses,
      nextCursor,
      hasMore: expenses.length === parseInt(limit),
    });
  } catch (error) {
    console.error('Error in getExpenses:', error.message, error.stack);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

// Get financial summary (balances)
export const getFinancialSummary = async (req, res) => {
  try {
    const { workspaceId } = req.query;
    const userId = req.user._id;

    console.log('Getting summary for workspace:', workspaceId, 'user:', userId);

    // Verify workspace membership
    const workspace = await Workspace.findById(workspaceId).populate('members.userId', 'fullName email profilePic');
    if (!workspace) {
      console.error('Workspace not found:', workspaceId);
      return res.status(404).json({ message: 'Workspace not found' });
    }
    
    // Check if user is owner or member
    const isOwner = workspace.ownerId.toString() === userId.toString();
    const isMember = workspace.members.some(member => 
      member.userId._id.toString() === userId.toString() && 
      (!member.status || member.status === 'ACTIVE')
    );
    
    console.log('Summary access check:', { workspaceId, userId, isOwner, isMember });
    
    if (!isOwner && !isMember) {
      console.error('User not authorized for summary:', userId);
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get all expenses for this workspace
    const expenses = await Expense.find({ workspaceId })
      .populate('paidBy', 'fullName email profilePic')
      .populate('participants.userId', 'fullName email profilePic');

    // Calculate balances
    const balances = {};
    
    // Initialize balances for all members
    workspace.members.forEach(member => {
      const memberId = member.userId._id.toString();
      balances[memberId] = {
        user: member.userId,
        balance: 0,
        totalPaid: 0,
        totalOwed: 0,
      };
    });

    // Calculate from expenses
    expenses.forEach(expense => {
      const paidById = expense.paidBy._id.toString();
      
      // Payer gets credited
      if (balances[paidById]) {
        balances[paidById].totalPaid += expense.amount;
      }

      // Each participant owes their share
      expense.participants.forEach(participant => {
        const participantId = participant.userId._id.toString();
        if (balances[participantId]) {
          balances[participantId].totalOwed += participant.share;
        }
      });
    });

    // Calculate net balance
    Object.keys(balances).forEach(userId => {
      balances[userId].balance = balances[userId].totalPaid - balances[userId].totalOwed;
    });

    // Get settlements
    const settlements = await Settlement.find({ workspaceId })
      .populate('payerId', 'fullName email profilePic')
      .populate('payeeId', 'fullName email profilePic')
      .sort({ settledAt: -1 });

    // Apply settlements to balances
    settlements.forEach(settlement => {
      const payerId = settlement.payerId._id.toString();
      const payeeId = settlement.payeeId._id.toString();
      
      if (balances[payerId]) {
        balances[payerId].balance -= settlement.amount;
      }
      if (balances[payeeId]) {
        balances[payeeId].balance += settlement.amount;
      }
    });

    // Calculate settlement suggestions (min cash flow)
    const settlementSuggestions = calculateMinCashFlow(balances);

    res.status(200).json({
      balances: Object.values(balances),
      settlementSuggestions,
      totalExpenses: expenses.reduce((sum, exp) => sum + exp.amount, 0),
      expenseCount: expenses.length,
      settlementCount: settlements.length,
    });
  } catch (error) {
    console.error('Error in getFinancialSummary:', error.message, error.stack);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

// Min cash flow algorithm for settlement suggestions
function calculateMinCashFlow(balances) {
  const creditors = [];
  const debtors = [];

  Object.values(balances).forEach(balance => {
    if (balance.balance > 0.01) {
      creditors.push({ ...balance });
    } else if (balance.balance < -0.01) {
      debtors.push({ ...balance });
    }
  });

  const suggestions = [];

  while (creditors.length > 0 && debtors.length > 0) {
    const creditor = creditors[0];
    const debtor = debtors[0];

    const amount = Math.min(creditor.balance, Math.abs(debtor.balance));

    suggestions.push({
      from: debtor.user,
      to: creditor.user,
      amount: parseFloat(amount.toFixed(2)),
    });

    creditor.balance -= amount;
    debtor.balance += amount;

    if (Math.abs(creditor.balance) < 0.01) creditors.shift();
    if (Math.abs(debtor.balance) < 0.01) debtors.shift();
  }

  return suggestions;
}

// Record settlement
export const recordSettlement = async (req, res) => {
  try {
    const { workspaceId, payerId, payeeId, amount, currency, notes } = req.body;
    const userId = req.user._id;

    // Verify workspace membership
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }
    
    // Check if user is owner or member
    const isOwner = workspace.ownerId.toString() === userId.toString();
    const isMember = workspace.members.some(member => 
      member.userId.toString() === userId.toString() && 
      (!member.status || member.status === 'ACTIVE')
    );
    
    if (!isOwner && !isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const settlement = new Settlement({
      workspaceId,
      payerId,
      payeeId,
      amount,
      currency: currency || 'USD',
      notes,
    });

    await settlement.save();

    const populatedSettlement = await Settlement.findById(settlement._id)
      .populate('payerId', 'fullName email profilePic')
      .populate('payeeId', 'fullName email profilePic');

    res.status(201).json({
      message: 'Settlement recorded successfully',
      settlement: populatedSettlement,
    });
  } catch (error) {
    console.error('Error in recordSettlement:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Export expenses as CSV
export const exportExpensesCSV = async (req, res) => {
  try {
    const { workspaceId } = req.query;
    const userId = req.user._id;

    // Verify workspace membership
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }
    
    // Check if user is owner or member
    const isOwner = workspace.ownerId.toString() === userId.toString();
    const isMember = workspace.members.some(member => 
      member.userId.toString() === userId.toString() && 
      (!member.status || member.status === 'ACTIVE')
    );
    
    if (!isOwner && !isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const expenses = await Expense.find({ workspaceId })
      .populate('paidBy', 'fullName email')
      .populate('participants.userId', 'fullName email')
      .sort({ date: -1 });

    // Generate CSV
    let csv = 'Date,Title,Amount,Currency,Paid By,Category,Split Type,Participants,Notes\n';
    
    expenses.forEach(expense => {
      const date = new Date(expense.date).toLocaleDateString();
      const title = `"${expense.title}"`;
      const amount = expense.amount;
      const currency = expense.currency;
      const paidBy = `"${expense.paidBy.fullName || expense.paidBy.email}"`;
      const category = expense.category;
      const splitType = expense.splitType;
      const participants = `"${expense.participants.map(p => p.userId.fullName || p.userId.email).join(', ')}"`;
      const notes = `"${expense.notes || ''}"`;
      
      csv += `${date},${title},${amount},${currency},${paidBy},${category},${splitType},${participants},${notes}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=expenses-${workspaceId}-${Date.now()}.csv`);
    res.status(200).send(csv);
  } catch (error) {
    console.error('Error in exportExpensesCSV:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Get settlements
export const getSettlements = async (req, res) => {
  try {
    const { workspaceId } = req.query;
    const userId = req.user._id;

    // Verify workspace membership
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }
    
    // Check if user is owner or member
    const isOwner = workspace.ownerId.toString() === userId.toString();
    const isMember = workspace.members.some(member => 
      member.userId.toString() === userId.toString() && 
      (!member.status || member.status === 'ACTIVE')
    );
    
    if (!isOwner && !isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const settlements = await Settlement.find({ workspaceId })
      .populate('payerId', 'fullName email profilePic')
      .populate('payeeId', 'fullName email profilePic')
      .sort({ settledAt: -1 });

    res.status(200).json({ settlements });
  } catch (error) {
    console.error('Error in getSettlements:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
