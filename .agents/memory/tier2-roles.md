---
name: Tier 2 special roles implementation
description: Where and how Tier 2 roles (Shadow, Gambler, Oracle, Vampire, Timekeeper, Mirage, Whisperer, Joker) are implemented
---

**Roles added:** timekeeper, shadow, gambler, mirage, whisperer, joker, oracle, vampire — all defined in `SPECIAL_ROLES_T2` in `constants/game.ts`.

**Assignment:** Pooled from TIER1_POOL + TIER2_POOL + PAIRED_POOL in `gameStore.assignRoles`. Slots from SPECIAL_ROLE_SLOTS by player count.

**Store actions:** useOracleAbility, useVampireBite, useGamblerBet, useMirageAbility, useWhispererMessage, useTimekeeperAbility, submitMrWhiteGuess — all in gameStore.ts.

**Mr. White guess:** Handled in EliminationScreen when eliminated player is mr_white. Shows text input → submitMrWhiteGuess() → correct triggers mr_white team win + Joker co-win.

**UI locations:**
- Shadow double vote: counted in submitVote (voteWeight = 2), shown in VotingScreen with 🌑 badge
- Gambler bet: bottom sheet modal in VotingScreen before Gambler's vote turn
- Oracle peek: SpecialRoleAbilityOverlay in ClueRoundScreen, result shown as banner
- Vampire bite: SpecialRoleAbilityOverlay in EliminationScreen after being eliminated, target gets isBitten=true → can't vote next round
- Timekeeper: +20s/-15s buttons in ClueRoundScreen, uses useTimer.addTime()
- Whisperer: two-step modal in ClueRoundScreen (pick target → type message → hold-to-reveal)
- Mirage: "swap word" button in WordRevealScreen if Undercover is alive
- Joker: win condition co-wins with Mr. White in checkWinCondition + awardPoints + WinScreen display

**Why:** Pass-and-play local game, all abilities shown when it's that player's physical turn with "pass device" UX.
