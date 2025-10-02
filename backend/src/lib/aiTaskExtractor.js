// AI-powered task extraction from chat messages
// This uses pattern matching and NLP techniques to identify actionable items

const actionVerbs = [
  'do', 'make', 'create', 'build', 'fix', 'update', 'review', 'check', 
  'send', 'call', 'email', 'schedule', 'plan', 'prepare', 'finish',
  'complete', 'implement', 'design', 'test', 'deploy', 'setup', 'configure',
  'write', 'draft', 'submit', 'approve', 'analyze', 'research', 'investigate'
];

const urgencyKeywords = {
  high: ['urgent', 'asap', 'immediately', 'critical', 'emergency', 'now', 'today'],
  medium: ['soon', 'this week', 'important', 'priority'],
  low: ['when possible', 'eventually', 'sometime', 'later']
};

const datePatterns = [
  { pattern: /by (tomorrow|today)/i, offset: 1 },
  { pattern: /by (monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i, offset: 7 },
  { pattern: /by (\d{1,2})(st|nd|rd|th)?/i, offset: 30 },
  { pattern: /in (\d+) (day|days|week|weeks)/i, offset: 7 },
];

export const extractTasksFromMessage = (message, senderId, workspaceId) => {
  const tasks = [];
  const text = message.toLowerCase();
  
  // Pattern 1: "need to [action]" or "have to [action]"
  const needToPattern = /(?:need to|have to|must|should|got to|gotta)\s+([^.!?\n]+)/gi;
  let match;
  
  while ((match = needToPattern.exec(message)) !== null) {
    const taskText = match[1].trim();
    if (taskText.length > 5 && taskText.length < 200) {
      tasks.push(createTaskObject(taskText, message, senderId, workspaceId));
    }
  }
  
  // Pattern 2: "can you [action]" or "could you [action]"
  const canYouPattern = /(?:can you|could you|would you|will you)\s+([^.!?\n]+)/gi;
  while ((match = canYouPattern.exec(message)) !== null) {
    const taskText = match[1].trim();
    if (taskText.length > 5 && taskText.length < 200) {
      tasks.push(createTaskObject(taskText, message, senderId, workspaceId));
    }
  }
  
  // Pattern 3: "let's [action]" or "we should [action]"
  const letsPattern = /(?:let's|lets|we should|we need to|we have to)\s+([^.!?\n]+)/gi;
  while ((match = letsPattern.exec(message)) !== null) {
    const taskText = match[1].trim();
    if (taskText.length > 5 && taskText.length < 200) {
      tasks.push(createTaskObject(taskText, message, senderId, workspaceId));
    }
  }
  
  // Pattern 4: "@mention [action verb]"
  const mentionPattern = /@\w+\s+(?:please\s+)?([a-z]+\s+[^.!?\n]+)/gi;
  while ((match = mentionPattern.exec(message)) !== null) {
    const taskText = match[1].trim();
    const firstWord = taskText.split(' ')[0].toLowerCase();
    if (actionVerbs.includes(firstWord) && taskText.length > 5 && taskText.length < 200) {
      tasks.push(createTaskObject(taskText, message, senderId, workspaceId));
    }
  }
  
  // Pattern 5: "TODO:" or "Action item:"
  const todoPattern = /(?:todo|action item|task):\s*([^.!?\n]+)/gi;
  while ((match = todoPattern.exec(message)) !== null) {
    const taskText = match[1].trim();
    if (taskText.length > 5 && taskText.length < 200) {
      tasks.push(createTaskObject(taskText, message, senderId, workspaceId));
    }
  }
  
  return tasks;
};

const createTaskObject = (taskText, originalMessage, senderId, workspaceId) => {
  const task = {
    title: cleanTaskTitle(taskText),
    description: `Auto-generated from message: "${originalMessage.substring(0, 100)}${originalMessage.length > 100 ? '...' : ''}"`,
    workspaceId,
    createdBy: senderId,
    status: 'TODO',
    priority: detectPriority(originalMessage),
    dueDate: detectDueDate(originalMessage),
    aiGenerated: true,
    confidence: calculateConfidence(taskText, originalMessage),
  };
  
  return task;
};

const cleanTaskTitle = (text) => {
  // Remove common prefixes
  let cleaned = text
    .replace(/^(please\s+|kindly\s+)/i, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Capitalize first letter
  cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  
  // Limit length
  if (cleaned.length > 100) {
    cleaned = cleaned.substring(0, 97) + '...';
  }
  
  return cleaned;
};

const detectPriority = (message) => {
  const text = message.toLowerCase();
  
  for (const keyword of urgencyKeywords.high) {
    if (text.includes(keyword)) return 'HIGH';
  }
  
  for (const keyword of urgencyKeywords.medium) {
    if (text.includes(keyword)) return 'MEDIUM';
  }
  
  return 'LOW';
};

const detectDueDate = (message) => {
  const text = message.toLowerCase();
  
  // Check for "today"
  if (text.includes('today')) {
    const date = new Date();
    date.setHours(23, 59, 59);
    return date;
  }
  
  // Check for "tomorrow"
  if (text.includes('tomorrow')) {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    date.setHours(23, 59, 59);
    return date;
  }
  
  // Check for "this week"
  if (text.includes('this week')) {
    const date = new Date();
    const daysUntilFriday = (5 - date.getDay() + 7) % 7;
    date.setDate(date.getDate() + daysUntilFriday);
    date.setHours(23, 59, 59);
    return date;
  }
  
  // Check for "next week"
  if (text.includes('next week')) {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    date.setHours(23, 59, 59);
    return date;
  }
  
  // Default: 7 days from now
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 7);
  defaultDate.setHours(23, 59, 59);
  return defaultDate;
};

const calculateConfidence = (taskText, originalMessage) => {
  let confidence = 0.5; // Base confidence
  
  // Higher confidence for explicit task indicators
  if (originalMessage.toLowerCase().includes('todo:') || 
      originalMessage.toLowerCase().includes('action item:')) {
    confidence += 0.3;
  }
  
  // Higher confidence for action verbs
  const firstWord = taskText.split(' ')[0].toLowerCase();
  if (actionVerbs.includes(firstWord)) {
    confidence += 0.2;
  }
  
  // Higher confidence for specific patterns
  if (originalMessage.toLowerCase().includes('need to') ||
      originalMessage.toLowerCase().includes('have to')) {
    confidence += 0.15;
  }
  
  // Lower confidence for very short or very long tasks
  if (taskText.length < 10 || taskText.length > 150) {
    confidence -= 0.1;
  }
  
  return Math.min(Math.max(confidence, 0), 1);
};

export const shouldSuggestTask = (confidence) => {
  return confidence >= 0.6; // Only suggest tasks with 60%+ confidence
};
