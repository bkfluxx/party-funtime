const CONNECTION_SETS = [
  {
    categories: [
      { name: "Coffee Drinks", items: ["ESPRESSO", "LATTE", "CAPPUCCINO", "MACCHIATO"], color: "yellow" },
      { name: "Things associated with Meetings", items: ["AGENDA", "MINUTES", "ACTION ITEMS", "SLIDES"], color: "green" },
      { name: "Keyboard Shortcuts", items: ["COPY", "PASTE", "UNDO", "SELECT ALL"], color: "blue" },
      { name: "____ Code", items: ["ZIP", "AREA", "QR", "SOURCE"], color: "purple" }
    ]
  },
  {
    categories: [
      { name: "Web Browsers", items: ["CHROME", "SAFARI", "FIREFOX", "EDGE"], color: "yellow" },
      { name: "Tech Acronyms", items: ["API", "URL", "HTML", "JSON"], color: "green" },
      { name: "Desk Items", items: ["STAPLER", "MONITOR", "NOTEPAD", "MOUSEPAD"], color: "blue" },
      { name: "Words before 'Party'", items: ["PIZZA", "BLOCK", "LIFESAVER", "HOUSE"], color: "purple" }
    ]
  }
];

export function createConnectionsState(players, options = {}) {
  const chosenSet = CONNECTION_SETS[Math.floor(Math.random() * CONNECTION_SETS.length)];
  const allItems = [];
  chosenSet.categories.forEach(cat => {
    cat.items.forEach(item => allItems.push({ text: item, category: cat.name, color: cat.color }));
  });

  return {
    status: 'playing', // 'playing', 'solved', 'failed'
    categories: chosenSet.categories,
    items: allItems.sort(() => 0.5 - Math.random()),
    foundCategories: [],
    mistakesRemaining: 4,
    selectedItems: []
  };
}

export function handleConnectionsAction(state, player, action, payload, room) {
  if (state.status !== 'playing') return null;

  if (action === 'submit_group') {
    const selected = payload.selectedItems; // Array of 4 strings
    if (!selected || selected.length !== 4) return null;

    // Check if 4 items match a category
    const matchedCategory = state.categories.find(cat => {
      return cat.items.every(item => selected.includes(item));
    });

    if (matchedCategory) {
      if (!state.foundCategories.some(c => c.name === matchedCategory.name)) {
        state.foundCategories.push(matchedCategory);
        // Remove items from grid
        state.items = state.items.filter(i => !matchedCategory.items.includes(i.text));

        // Point rewards
        for (const p of room.players.values()) {
          p.score = (p.score || 0) + 250;
        }

        if (state.foundCategories.length === 4) {
          state.status = 'solved';
        }

        return { type: 'category_found', category: matchedCategory, allSolved: state.status === 'solved' };
      }
    } else {
      state.mistakesRemaining -= 1;
      if (state.mistakesRemaining <= 0) {
        state.status = 'failed';
      }
      return { type: 'mistake', mistakesRemaining: state.mistakesRemaining, status: state.status };
    }
  }

  return null;
}
