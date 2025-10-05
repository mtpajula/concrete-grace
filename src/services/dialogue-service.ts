/**
 * Dialogue Service - Manages Aalto building conversations
 * Separates dialogue logic from component concerns
 */

export interface DialogueOption {
  text: string
  response: string
}

export interface DialogueEntry {
  id: string
  speaker: 'player' | 'architect'
  text: string
}

export class DialogueService {
  private responses = {
    architect_response_1: "This is the echo of what was. A memory of curves in a world of angles.",
    architect_response_2: "You took what was needed. The green gave way to grey. Life is a loan, repaid in concrete.",
    architect_response_3: "The concrete remembers. It holds the shape of every choice. Every consumption."
  }

  private availableOptions: DialogueOption[] = [
    { text: "What is this place?", response: "architect_response_1" },
    { text: "Why does everything feel so... empty?", response: "architect_response_2" },
    { text: "The concrete speaks to me.", response: "architect_response_3" }
  ]

  /**
   * Initialize dialogue session for a specific Aalto building
   */
  initializeDialogue(buildingId: string): {
    options: DialogueOption[]
    recentDialogue: DialogueEntry[]
  } {
    return {
      options: [...this.availableOptions],
      recentDialogue: []
    }
  }

  /**
   * Process player's dialogue choice
   */
  selectOption(option: DialogueOption, currentDialogue: DialogueEntry[]): DialogueEntry[] {
    const updatedDialogue = [...currentDialogue]
    
    // Add player message
    updatedDialogue.push({
      id: `player_${Date.now()}`,
      speaker: 'player',
      text: option.text
    })

    // Add architect response
    updatedDialogue.push({
      id: `architect_${Date.now()}`,
      speaker: 'architect',
      text: this.responses[option.response as keyof typeof this.responses] || "The concrete speaks in silence."
    })

    return updatedDialogue
  }

  /**
   * Get available dialogue options
   */
  getAvailableOptions(): DialogueOption[] {
    return [...this.availableOptions]
  }

  /**
   * Close dialogue session
   */
  closeDialogue(): {
    options: DialogueOption[]
    recentDialogue: DialogueEntry[]
  } {
    return {
      options: [],
      recentDialogue: []
    }
  }
}

// Singleton instance for use throughout the application
export const dialogueService = new DialogueService()
