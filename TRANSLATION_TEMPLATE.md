# Translation Template - New Keys Added

This document contains all NEW translation keys that need to be translated into:
- Spanish (ES)
- Portuguese (PT)
- Italian (IT)
- German (DE)
- Arabic (AR)
- Hindi (HI)

## Instructions

1. Copy the JSON structure below
2. Translate ONLY the values (right side of the colon)
3. Keep all keys (left side) exactly as shown
4. Maintain JSON formatting (commas, quotes, brackets)
5. Add to the corresponding language file in `src/locales/[language]/translation.json`

---

## Authentication Section

Add these keys to the `"auth"` section:

```json
"orContinueWith": "OR CONTINUE WITH",
"placeholders": {
  "email": "trader@example.com",
  "fullName": "John Doe",
  "country": "United States",
  "password": "Enter your password",
  "confirmPassword": "Confirm your password"
}
```

---

## Dashboard Section

Add these keys to the `"dashboard"` section:

```json
"columns": {
  "one": "1 Column",
  "two": "2 Columns",
  "three": "3 Columns"
},
"pickDateRange": "Pick a date range",
"hiddenWidgets": "Hidden Widgets",
"clickToShow": "Click to show:"
```

---

## Widgets Section

Update the `"recentTransactions"` key:

```json
"recentTransactions": {
  "title": "Recent Transactions",
  "description": "Your latest trading activity",
  "viewAll": "View all",
  "noTransactions": "No transactions yet"
}
```

---

## NEW Sidebar Section

Add this entirely NEW section after `"time"`:

```json
"sidebar": {
  "expandAll": "Expand All",
  "collapseAll": "Collapse All",
  "searchPlaceholder": "Search menu...",
  "favorites": "Favorites",
  "removeFromFavorites": "Remove from favorites"
}
```

---

## NEW Keyboard Shortcuts Section

Add this entirely NEW section:

```json
"keyboardShortcuts": {
  "title": "Keyboard Shortcuts",
  "subtitle": "Speed up your workflow with these keyboard shortcuts",
  "footer": "anytime to view this help",
  "footerPrefix": "Press",
  "categories": {
    "navigation": "Navigation",
    "dashboardActions": "Dashboard Actions",
    "aiAssistant": "AI Assistant",
    "general": "General"
  },
  "shortcuts": {
    "goToDashboard": "Go to Dashboard",
    "goToUpload": "Go to Upload",
    "goToForecast": "Go to Forecast",
    "goToAnalytics": "Go to Analytics",
    "goToTools": "Go to Tools",
    "goToHome": "Go to Home",
    "goToSettings": "Go to Settings",
    "addNewTrade": "Add new trade",
    "exportTrades": "Export trades",
    "customizeDashboard": "Customize dashboard",
    "navigateSections": "Navigate between sections",
    "openAIAssistant": "Open AI Assistant",
    "sendMessage": "Send message (in chat)",
    "showShortcuts": "Show keyboard shortcuts",
    "closeDialogs": "Close dialogs/modals",
    "focusSearch": "Focus search",
    "toggleSidebar": "Toggle sidebar"
  }
}
```

---

## NEW Date Range Section

Add this entirely NEW section:

```json
"dateRange": {
  "pickDateRange": "Pick a date range",
  "quickSelect": "Quick Select",
  "presets": {
    "last7Days": "Last 7 days",
    "last30Days": "Last 30 days",
    "last90Days": "Last 90 days",
    "thisMonth": "This Month"
  },
  "cancel": "Cancel",
  "apply": "Apply",
  "showingData": "Showing data for"
}
```

---

## NEW Export Section

Add this entirely NEW section:

```json
"export": {
  "title": "Export Trades",
  "description": "Choose a format to export your",
  "trade": "trade",
  "trades": "trades",
  "formats": {
    "csv": {
      "title": "CSV Format",
      "description": "Compatible with Excel, Google Sheets, and other spreadsheets"
    },
    "csvWithSummary": {
      "title": "CSV with Summary",
      "description": "Includes performance summary at the top"
    },
    "json": {
      "title": "JSON Format",
      "description": "For developers and data analysis tools"
    }
  },
  "success": {
    "csv": "Trades exported as CSV",
    "json": "Trades exported as JSON",
    "summary": "Trades exported with summary"
  },
  "error": "Failed to export trades"
}
```

---

## NEW User Menu Section

Add this entirely NEW section:

```json
"userMenu": {
  "hello": "Hello",
  "myAccount": "My Account",
  "changePassword": "Change Password",
  "logout": "Logout",
  "dialog": {
    "title": "Change Password",
    "description": "Choose how you'd like to change your password",
    "changeNow": "Change Password Now",
    "changeNowDescription": "Set a new password immediately",
    "newPassword": "New Password",
    "confirmPassword": "Confirm Password",
    "newPasswordPlaceholder": "Enter new password",
    "confirmPasswordPlaceholder": "Confirm new password",
    "updating": "Updating...",
    "updatePassword": "Update Password",
    "or": "Or",
    "sendResetEmail": "Send Reset Email",
    "sendResetEmailDescription": "We'll send a password reset link to",
    "sending": "Sending...",
    "sendEmail": "Send Reset Email",
    "success": "Password updated successfully! Please sign in again.",
    "resetEmailSent": "Password reset email sent! Check your inbox.",
    "error": "Failed to update password",
    "resetError": "Failed to send reset email"
  }
}
```

---

## Additional Pages to Translate (From Screenshots)

### User Guide Page
```json
"userGuide": {
  "title": "User Guide",
  "subtitle": "Everything you need to master The Trading Diary",
  "searchPlaceholder": "Search guide...",
  "tabs": {
    "quickStart": "Quick Start",
    "navigation": "Navigation",
    "features": "Features",
    "tips": "Tips",
    "troubleshooting": "Troubleshooting",
    "faq": "FAQ"
  },
  "faqTitle": "Frequently Asked Questions",
  "faqSubtitle": "20 common questions with concise answers.",
  "questions": {
    "q1": "Is my trading data private?",
    "q2": "Can I use this offline?",
    "q3": "Which exchanges are supported?",
    "q4": "How do I delete a trade?",
    "q5": "Can I export my data?",
    "q6": "What's the maximum number of trades?",
    "q7": "How are fees calculated?",
    "q8": "Can I share my performance?",
    "q9": "Is there a mobile app?",
    "q10": "How do I change my password?",
    "q11": "What's the difference between ROI and P&L?",
    "q12": "Can I track multiple accounts?",
    "q13": "How often should I log trades?",
    "q14": "What are XP and levels for?",
    "q15": "Can I undo a deleted trade?"
  }
}
```

### Trading Plan Page
```json
"tradingPlan": {
  "title": "Trading Plan",
  "subtitle": "Create and follow your structured trading strategy",
  "tabs": {
    "myPlans": "My Plans",
    "checklist": "Checklist",
    "editor": "Editor"
  },
  "emptyState": {
    "title": "No Trading Plans Yet",
    "description": "Create your first trading plan to document your strategy and rules",
    "button": "Create Trading Plan"
  },
  "checklist": {
    "title": "Pre-Trade Checklist",
    "subtitle": "No active plan selected",
    "completion": "Completion",
    "reset": "Reset",
    "sections": {
      "preTrade": "Pre-Trade",
      "entry": "Entry",
      "inTrade": "In-Trade"
    },
    "items": {
      "checkMarket": "Check market conditions",
      "reviewPlan": "Review active trading plan",
      "assessMental": "Assess mental/emotional state",
      "verifyRisk": "Verify daily risk limits not exceeded",
      "validSetup": "Valid setup identified per plan",
      "entryCriteria": "All entry criteria met",
      "positionSize": "Position size calculated correctly",
      "stopLoss": "Stop loss set before entry",
      "profitTarget": "Profit target defined"
    }
  }
}
```

### Reports & Export Page
```json
"reports": {
  "title": "Reports & Export",
  "subtitle": "Generate comprehensive trading performance reports",
  "tabs": {
    "generate": "Generate",
    "history": "History",
    "scheduled": "Scheduled"
  },
  "settings": {
    "title": "Report Settings",
    "subtitle": "Configure your trading report parameters",
    "reportType": "Report Type",
    "reportFormat": "Report Format",
    "types": {
      "monthly": "Monthly Report",
      "weekly": "Weekly Report",
      "custom": "Custom Report"
    },
    "formats": {
      "pdf": "PDF Document",
      "excel": "Excel Spreadsheet",
      "csv": "CSV File"
    }
  },
  "sections": {
    "title": "Report Sections",
    "subtitle": "Select sections to include in your report",
    "items": {
      "executiveSummary": "Executive Summary",
      "performanceMetrics": "Performance Metrics",
      "tradeHistory": "Trade History",
      "advancedAnalytics": "Advanced Analytics",
      "riskAnalysis": "Risk Analysis",
      "goalsProgress": "Goals Progress",
      "chartsVisualizations": "Charts & Visualizations",
      "aiInsights": "AI Insights"
    }
  },
  "actions": {
    "generateReport": "Generate Report",
    "email": "Email"
  },
  "history": {
    "title": "Report History",
    "subtitle": "Previously generated trading reports",
    "badges": {
      "monthly": "monthly",
      "pdf": "PDF"
    },
    "dateRange": "Oct 22 - Oct 22, 2025",
    "generated": "Generated: Oct 21, 2025",
    "actions": {
      "view": "View",
      "download": "Download",
      "delete": "Delete"
    }
  },
  "scheduled": {
    "title": "Scheduled Reports",
    "subtitle": "Automate report generation and delivery",
    "emptyState": {
      "title": "No Scheduled Reports",
      "description": "Create your first automated report schedule"
    },
    "button": "Add Schedule"
  }
}
```

### Tax Reports Page
```json
"taxReports": {
  "title": "Tax Reports",
  "subtitle": "Generate tax reports for your trading activity",
  "year": "2025",
  "exportCSV": "Export CSV",
  "metrics": {
    "netPnL": {
      "title": "Net P&L",
      "subtitle": "After fees and losses"
    },
    "totalGains": {
      "title": "Total Gains",
      "subtitle": "Gross profit from wins"
    },
    "totalLosses": {
      "title": "Total Losses",
      "subtitle": "Total losses deductible"
    },
    "totalFees": {
      "title": "Total Fees",
      "subtitle": "Deductible expenses"
    }
  },
  "tabs": {
    "summary": "Summary",
    "shortTerm": "Short-term (ST)",
    "longTerm": "Long-term (LT)"
  },
  "summary": {
    "title": "Tax Summary for 2025",
    "subtitle": "Overview of your trading activity for tax purposes",
    "totalTrades": "Total Trades",
    "totalFeesPaid": "Total Fees Paid",
    "shortTermGains": "Short-term Gains",
    "totalGains": "Total Gains",
    "longTermGains": "Long-term Gains",
    "totalLosses": "Total Losses"
  },
  "disclaimer": "This report is for informational purposes only and should not be considered tax advice. Please consult with a qualified tax professional or accountant for accurate tax filing."
}
```

### Achievement Badges Page
```json
"achievements": {
  "title": "Achievement Badges",
  "subtitle": "Track your trading milestones and unlock badges as you progress",
  "sectionTitle": "Achievement Badges",
  "sectionSubtitle": "Unlock badges by reaching trading milestones",
  "unlocked": "Unlocked",
  "unlockedCount": "7/11 Unlocked",
  "badges": {
    "firstTrade": {
      "title": "First Trade",
      "description": "Complete your first trade",
      "rarity": "common"
    },
    "consistentTrader": {
      "title": "Consistent Trader",
      "description": "Log 10 trades",
      "rarity": "common"
    },
    "veteranTrader": {
      "title": "Veteran Trader",
      "description": "Log 100 trades",
      "rarity": "rare",
      "progress": "32%",
      "count": "32 / 100"
    },
    "hotStreak": {
      "title": "Hot Streak",
      "description": "Win 3 trades in a row",
      "rarity": "common"
    },
    "onFire": {
      "title": "On Fire",
      "description": "Win 5 trades in a row",
      "rarity": "rare"
    },
    "unstoppable": {
      "title": "Unstoppable",
      "description": "Win 10 trades in a row",
      "rarity": "epic",
      "progress": "70%",
      "count": "7 / 10"
    },
    "firstProfit": {
      "title": "First Profit",
      "description": "Reach $100 total profit",
      "rarity": "common"
    },
    "highRoller": {
      "title": "High Roller",
      "description": "Reach $1,000 total profit",
      "rarity": "rare",
      "progress": "69%",
      "count": "688 / 1000"
    },
    "masterTrader": {
      "title": "Master Trader",
      "description": "Reach $10,000 total profit",
      "rarity": "legendary",
      "progress": "7%",
      "count": "688 / 10000"
    },
    "sharpshooter": {
      "title": "Sharpshooter",
      "description": "Achieve 70% win rate with 20+ trades",
      "rarity": "rare"
    },
    "beastMode": {
      "title": "Beast Mode",
      "description": "Have 5 days with >70% win rate",
      "rarity": "epic"
    }
  }
}
```

### Progress & XP Page
```json
"progressXP": {
  "title": "Progress & XP",
  "subtitle": "Track your trading journey, earn rewards, and level up",
  "cards": {
    "currentLevel": "Current Level",
    "totalXP": "Total XP",
    "challenges": "Challenges",
    "totalTrades": "Total Trades"
  },
  "levelProgress": {
    "title": "Level Progress",
    "level": "Level 1",
    "toNextLevel": "20.0% to next level"
  },
  "todaysChallenges": "Today's Challenges",
  "challenges": {
    "reflectionMaster": "Reflection Master",
    "consistencyChampion": "Consistency Champion",
    "activeTrader": "Active Trader"
  },
  "tradingStreaks": "Trading Streaks",
  "streakCards": {
    "currentStreak": {
      "title": "Current Streak",
      "unit": "wins"
    },
    "bestStreak": {
      "title": "Best Streak",
      "unit": "wins"
    },
    "maxDrawdown": {
      "title": "Max Drawdown",
      "unit": "trades"
    },
    "tradingDays": {
      "title": "Trading Days",
      "unit": "days"
    }
  }
}
```

---

## Translation Tips

### For Professional Translators:

1. **Context Matters**: Many terms are trading-specific:
   - "P&L" = Profit & Loss
   - "ROI" = Return on Investment
   - "Win Rate" = Percentage of profitable trades
   - "Drawdown" = Decline from peak

2. **Maintain Consistency**: Use the same term for repeated concepts across all sections

3. **Character Limits**: Some UI elements have space constraints:
   - Button labels should be concise
   - Menu items should be short
   - Tooltips can be longer

4. **Technical Terms**: Some terms should remain in English or use accepted translations:
   - CSV, JSON, PDF, Excel (usually kept as-is)
   - API, XP, AI (commonly kept in original form)

5. **Formality**: Use appropriate level of formality for your language:
   - Professional tone for reports and settings
   - Friendly tone for achievements and gamification
   - Encouraging tone for empty states

---

## Testing Your Translations

After adding translations:

1. Switch language in the app settings
2. Navigate through all pages
3. Check for:
   - Text overflow (text too long for containers)
   - Missing translations (shows English key instead)
   - Grammar/context issues
   - RTL layout issues (for Arabic)

---

## File Structure

Each language file location:
- Spanish: `src/locales/es/translation.json`
- Portuguese: `src/locales/pt/translation.json`
- Italian: `src/locales/it/translation.json`
- German: `src/locales/de/translation.json`
- Arabic: `src/locales/ar/translation.json`
- Hindi: `src/locales/hi/translation.json`

---

## Need Help?

If you encounter issues:
1. Verify JSON formatting (use a JSON validator)
2. Check for missing commas or quotes
3. Ensure all brackets are properly closed
4. Test one language at a time

## Professional Translation Services

You can use these services for high-quality translations:
- **DeepL Pro**: Best for European languages (ES, PT, IT, DE)
- **Google Translate API**: Good for all languages, especially HI
- **Localize**: Professional translation platform
- **Crowdin**: Collaborative translation tool
- **Human translators**: For best quality and cultural context

Export this template and provide it to your translation service!
