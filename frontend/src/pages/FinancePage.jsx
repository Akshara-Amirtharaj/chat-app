import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useFinanceStore } from "../store/useFinanceStore";
import { useWorkspaceStore } from "../store/useWorkspaceStore";
import { useAuthStore } from "../store/useAuthStore";
import { 
  Loader, Plus, DollarSign, TrendingUp, TrendingDown, 
  Download, Users, ArrowRightLeft, Receipt, CheckCircle 
} from "lucide-react";
import AddExpenseModal from "../components/AddExpenseModal";
import RecordSettlementModal from "../components/RecordSettlementModal";

const FinancePage = () => {
  const { id } = useParams(); // workspace ID
  const navigate = useNavigate();
  const { authUser } = useAuthStore();
  const { workspaces, getWorkspaces } = useWorkspaceStore();
  const { 
    expenses, 
    summary, 
    settlements,
    getExpenses, 
    getFinancialSummary,
    getSettlements,
    exportCSV,
    isLoadingExpenses,
    isLoadingSummary,
  } = useFinanceStore();

  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isSettlementOpen, setIsSettlementOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState('expenses'); // expenses, balances, settlements

  const workspace = workspaces.find(w => w._id === id);

  useEffect(() => {
    // Load workspaces first if not loaded
    if (workspaces.length === 0) {
      getWorkspaces();
    }
  }, []);

  useEffect(() => {
    // Redirect if no workspace ID
    if (!id || id === 'undefined') {
      navigate('/workspaces');
      return;
    }

    if (id) {
      getExpenses(id);
      getFinancialSummary(id);
      getSettlements(id);
    }
  }, [id, navigate]);

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'FOOD': return '🍔';
      case 'TRANSPORT': return '🚗';
      case 'ACCOMMODATION': return '🏠';
      case 'ENTERTAINMENT': return '🎬';
      case 'UTILITIES': return '💡';
      case 'SHOPPING': return '🛍️';
      default: return '💰';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'FOOD': return 'badge-warning';
      case 'TRANSPORT': return 'badge-info';
      case 'ACCOMMODATION': return 'badge-primary';
      case 'ENTERTAINMENT': return 'badge-secondary';
      case 'UTILITIES': return 'badge-accent';
      case 'SHOPPING': return 'badge-success';
      default: return 'badge-ghost';
    }
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <div className="min-h-screen pt-20 p-6 bg-gradient-to-br from-base-200 via-base-300 to-base-200">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-success to-primary flex items-center justify-center shadow-lg">
                  <DollarSign className="w-6 h-6 text-primary-content" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-success to-primary bg-clip-text text-transparent">
                    {workspace?.name} Finance
                  </h1>
                  <p className="text-sm opacity-60 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                    Track expenses, split bills, settle up
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => exportCSV(id)}
                className="btn btn-ghost gap-2"
              >
                <Download className="w-5 h-5" />
                Export CSV
              </button>
              <button
                onClick={() => setIsAddExpenseOpen(true)}
                className="btn btn-primary gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="w-5 h-5" />
                Add Expense
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="card bg-gradient-to-br from-base-100 to-base-200 shadow-xl">
                <div className="card-body p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm opacity-60">Total Expenses</div>
                      <div className="text-2xl font-bold">{formatCurrency(summary.totalExpenses)}</div>
                    </div>
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <Receipt className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <div className="text-xs opacity-60 mt-2">{summary.expenseCount} transactions</div>
                </div>
              </div>

              <div className="card bg-gradient-to-br from-base-100 to-base-200 shadow-xl">
                <div className="card-body p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm opacity-60">Your Balance</div>
                      <div className={`text-2xl font-bold ${
                        summary.balances?.find(b => b.user._id === authUser?._id)?.balance > 0 
                          ? 'text-success' 
                          : summary.balances?.find(b => b.user._id === authUser?._id)?.balance < 0
                          ? 'text-error'
                          : ''
                      }`}>
                        {formatCurrency(summary.balances?.find(b => b.user._id === authUser?._id)?.balance || 0)}
                      </div>
                    </div>
                    <div className="p-3 bg-success/10 rounded-xl">
                      {summary.balances?.find(b => b.user._id === authUser?._id)?.balance > 0 ? (
                        <TrendingUp className="w-6 h-6 text-success" />
                      ) : (
                        <TrendingDown className="w-6 h-6 text-error" />
                      )}
                    </div>
                  </div>
                  <div className="text-xs opacity-60 mt-2">
                    {summary.balances?.find(b => b.user._id === authUser?._id)?.balance > 0 
                      ? 'You are owed' 
                      : summary.balances?.find(b => b.user._id === authUser?._id)?.balance < 0
                      ? 'You owe'
                      : 'All settled up'}
                  </div>
                </div>
              </div>

              <div className="card bg-gradient-to-br from-base-100 to-base-200 shadow-xl">
                <div className="card-body p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm opacity-60">Settlements</div>
                      <div className="text-2xl font-bold">{summary.settlementCount}</div>
                    </div>
                    <div className="p-3 bg-info/10 rounded-xl">
                      <CheckCircle className="w-6 h-6 text-info" />
                    </div>
                  </div>
                  <div className="text-xs opacity-60 mt-2">Completed payments</div>
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2 p-1 bg-base-100/50 backdrop-blur-sm rounded-xl border border-base-300/50 w-fit">
            <button
              className={`btn btn-sm ${selectedTab === 'expenses' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setSelectedTab('expenses')}
            >
              <Receipt className="w-4 h-4" />
              Expenses
            </button>
            <button
              className={`btn btn-sm ${selectedTab === 'balances' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setSelectedTab('balances')}
            >
              <Users className="w-4 h-4" />
              Balances
            </button>
            <button
              className={`btn btn-sm ${selectedTab === 'settlements' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setSelectedTab('settlements')}
            >
              <ArrowRightLeft className="w-4 h-4" />
              Settlements
            </button>
          </div>
        </div>

        {/* Content */}
        {selectedTab === 'expenses' && (
          <div className="space-y-4">
            {isLoadingExpenses ? (
              <div className="flex items-center justify-center h-64">
                <Loader className="w-8 h-8 animate-spin" />
              </div>
            ) : expenses.length === 0 ? (
              <div className="text-center py-12">
                <Receipt className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No expenses yet</h3>
                <p className="text-sm opacity-70 mb-4">Start tracking expenses with your team</p>
                <button className="btn btn-primary gap-2" onClick={() => setIsAddExpenseOpen(true)}>
                  <Plus className="w-5 h-5" />
                  Add First Expense
                </button>
              </div>
            ) : (
              expenses.map((expense) => (
                <div
                  key={expense._id}
                  className="card bg-gradient-to-br from-base-100 to-base-200 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <div className="card-body p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="text-4xl">{getCategoryIcon(expense.category)}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-bold">{expense.title}</h3>
                            <span className={`badge ${getCategoryColor(expense.category)} badge-sm`}>
                              {expense.category}
                            </span>
                          </div>
                          {expense.description && (
                            <p className="text-sm opacity-70 mb-2">{expense.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm opacity-60">
                            <span>Paid by {expense.paidBy.fullName || expense.paidBy.email}</span>
                            <span>•</span>
                            <span>{new Date(expense.date).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>{expense.participants.length} participants</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {formatCurrency(expense.amount, expense.currency)}
                        </div>
                        <div className="text-xs opacity-60 mt-1">{expense.splitType}</div>
                      </div>
                    </div>
                    
                    {/* Participants */}
                    <div className="mt-4 pt-4 border-t border-base-300">
                      <div className="flex flex-wrap gap-2">
                        {expense.participants.map((participant, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-base-200/50 rounded-lg">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary text-primary-content flex items-center justify-center text-xs font-bold">
                              {participant.userId.fullName?.[0] || participant.userId.email?.[0]}
                            </div>
                            <span className="text-sm">{participant.userId.fullName || participant.userId.email}</span>
                            <span className="text-sm font-semibold text-primary">
                              {formatCurrency(participant.share, expense.currency)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {selectedTab === 'balances' && summary && (
          <div className="space-y-6">
            {/* Settlement Suggestions */}
            {summary.settlementSuggestions && summary.settlementSuggestions.length > 0 && (
              <div className="card bg-gradient-to-br from-warning/10 to-warning/5 border border-warning/20 shadow-xl">
                <div className="card-body p-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <ArrowRightLeft className="w-5 h-5 text-warning" />
                    Suggested Settlements
                  </h2>
                  <div className="space-y-3">
                    {summary.settlementSuggestions.map((suggestion, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-base-100 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-error to-warning text-primary-content flex items-center justify-center font-bold">
                            {suggestion.from.fullName?.[0] || suggestion.from.email?.[0]}
                          </div>
                          <span className="font-semibold">{suggestion.from.fullName || suggestion.from.email}</span>
                          <ArrowRightLeft className="w-4 h-4 opacity-60" />
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-success text-primary-content flex items-center justify-center font-bold">
                            {suggestion.to.fullName?.[0] || suggestion.to.email?.[0]}
                          </div>
                          <span className="font-semibold">{suggestion.to.fullName || suggestion.to.email}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xl font-bold text-success">
                            {formatCurrency(suggestion.amount)}
                          </span>
                          <button
                            onClick={() => setIsSettlementOpen(true)}
                            className="btn btn-success btn-sm"
                          >
                            Settle
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* All Balances */}
            <div className="card bg-gradient-to-br from-base-100 to-base-200 shadow-xl">
              <div className="card-body p-6">
                <h2 className="text-xl font-bold mb-4">Member Balances</h2>
                <div className="space-y-3">
                  {summary.balances?.map((balance, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-base-200/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary text-primary-content flex items-center justify-center font-bold">
                          {balance.user.fullName?.[0] || balance.user.email?.[0]}
                        </div>
                        <div>
                          <div className="font-semibold">{balance.user.fullName || balance.user.email}</div>
                          <div className="text-xs opacity-60">
                            Paid: {formatCurrency(balance.totalPaid)} • Owed: {formatCurrency(balance.totalOwed)}
                          </div>
                        </div>
                      </div>
                      <div className={`text-xl font-bold ${
                        balance.balance > 0 ? 'text-success' : balance.balance < 0 ? 'text-error' : ''
                      }`}>
                        {formatCurrency(balance.balance)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'settlements' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Settlement History</h2>
              <button
                onClick={() => setIsSettlementOpen(true)}
                className="btn btn-primary btn-sm gap-2"
              >
                <Plus className="w-4 h-4" />
                Record Settlement
              </button>
            </div>
            
            {settlements.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No settlements yet</h3>
                <p className="text-sm opacity-70">Record payments to keep track of who paid whom</p>
              </div>
            ) : (
              settlements.map((settlement) => (
                <div
                  key={settlement._id}
                  className="card bg-gradient-to-br from-base-100 to-base-200 shadow-lg"
                >
                  <div className="card-body p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-error to-warning text-primary-content flex items-center justify-center font-bold">
                          {settlement.payerId.fullName?.[0] || settlement.payerId.email?.[0]}
                        </div>
                        <span className="font-semibold">{settlement.payerId.fullName || settlement.payerId.email}</span>
                        <ArrowRightLeft className="w-5 h-5 text-success" />
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-success text-primary-content flex items-center justify-center font-bold">
                          {settlement.payeeId.fullName?.[0] || settlement.payeeId.email?.[0]}
                        </div>
                        <span className="font-semibold">{settlement.payeeId.fullName || settlement.payeeId.email}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-success">
                          {formatCurrency(settlement.amount, settlement.currency)}
                        </div>
                        <div className="text-xs opacity-60">
                          {new Date(settlement.settledAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    {settlement.notes && (
                      <p className="text-sm opacity-70 mt-2">{settlement.notes}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        workspaceId={id}
        workspace={workspace}
      />
      
      <RecordSettlementModal
        isOpen={isSettlementOpen}
        onClose={() => setIsSettlementOpen(false)}
        workspaceId={id}
        workspace={workspace}
      />
    </div>
  );
};

export default FinancePage;
