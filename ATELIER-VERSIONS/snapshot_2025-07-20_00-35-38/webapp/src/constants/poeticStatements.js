/**
 * Poetic Statements for Atelier Welcome Page
 * 
 * These statements rotate randomly on each page load to provide
 * inspiration and maintain the creative breathing space philosophy.
 * 
 * Structure ready for future context-awareness:
 * - userType (new/returning/power)
 * - timeOfDay (morning/evening/weekend)
 * - theme (light/dark)
 */

export const poeticStatements = [
  // Default set - Universal inspiration
  { 
    text: "Where ideas breathe. Atelier is not a dashboard. It's a living space for quiet discovery, where technology disappears when not needed.", 
    type: "default",
    context: ["universal"] 
  },
  { 
    text: "Every feature is an invitation, not a command. Pause, then choose your next creative gesture.", 
    type: "default",
    context: ["universal"] 
  },
  { 
    text: "Here, inspiration is not forced. It emerges when you give yourself space to breathe.", 
    type: "default",
    context: ["universal"] 
  },
  { 
    text: "Let your intention shape the canvas. Atelier follows your rhythm, not the other way around.", 
    type: "default",
    context: ["universal"] 
  },
  { 
    text: "This is not a tool; it's a place. Sometimes, the best creation starts with a moment of stillness.", 
    type: "default",
    context: ["universal"] 
  },
  { 
    text: "Step in, explore, or simply breathe. Your creative direction begins here.", 
    type: "default",
    context: ["universal"] 
  },
  { 
    text: "Creativity is welcome here – even when it's unsure, hesitant, or changing its mind.", 
    type: "default",
    context: ["universal"] 
  },
  { 
    text: "In Atelier, the silence between actions is as important as the actions themselves.", 
    type: "default",
    context: ["universal"] 
  },

  // New user focused
  { 
    text: "Welcome to your creative space. There's no wrong way to begin.", 
    type: "welcoming",
    context: ["newUser"] 
  },
  { 
    text: "Every creative journey starts with a single gesture. What will yours be?", 
    type: "welcoming",
    context: ["newUser"] 
  },

  // Returning user focused
  { 
    text: "Welcome back. Your ideas have been waiting patiently.", 
    type: "familiar",
    context: ["returning"] 
  },
  { 
    text: "The canvas remembers. Continue where inspiration left off.", 
    type: "familiar",
    context: ["returning"] 
  },

  // Power user focused
  { 
    text: "In the depth of winter, I finally learned that within me there lay an invincible summer.", 
    type: "philosophical",
    context: ["powerUser"] 
  },
  { 
    text: "The expert in anything was once a beginner who refused to give up their sense of wonder.", 
    type: "philosophical",
    context: ["powerUser"] 
  },

  // Time-aware statements (ready for future implementation)
  { 
    text: "Morning brings fresh possibilities. What will you create in today's light?", 
    type: "temporal",
    context: ["morning"] 
  },
  { 
    text: "Evening is for reflection. Review today's creative journey and prepare tomorrow's intention.", 
    type: "temporal",
    context: ["evening"] 
  },
  { 
    text: "Weekend energy: explore without deadlines, create without pressure.", 
    type: "temporal",
    context: ["weekend"] 
  }
];

// Helper function to filter statements by context (ready for future features)
export const getContextualStatements = (context = ["universal"]) => {
  return poeticStatements.filter(statement => 
    statement.context.some(ctx => context.includes(ctx))
  );
};

// Helper function to get a random statement with optional context filtering
export const getRandomStatement = (context = ["universal"]) => {
  const filtered = getContextualStatements(context);
  const randomIndex = Math.floor(Math.random() * filtered.length);
  return filtered[randomIndex];
};

// Helper function to avoid immediate repetition
export const getRandomStatementExcluding = (lastIndex, context = ["universal"]) => {
  const filtered = getContextualStatements(context);
  if (filtered.length <= 1) return filtered[0];
  
  let newStatement;
  do {
    newStatement = getRandomStatement(context);
  } while (newStatement === poeticStatements[lastIndex]);
  
  return newStatement;
};