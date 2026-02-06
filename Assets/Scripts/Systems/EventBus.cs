using System;
using DetectiveGame.Models;

namespace DetectiveGame.Systems
{
    /// <summary>
    /// Centralized event bus for game-wide communication.
    /// Uses strongly-typed C# events to decouple systems.
    /// </summary>
    public static class EventBus
    {
        // ===== Clue Events =====
        public static event Action<ClueData> OnClueCollected;
        public static event Action<string, bool> OnClueMarkedImportant; // clueId, isImportant
        public static event Action<ClueData> OnClueUnlocked;

        // ===== Dialogue Events =====
        public static event Action<string, QuestionData> OnQuestionAsked; // suspectId, question
        public static event Action<string, QuestionData> OnQuestionUnlocked; // suspectId, question

        // ===== Timeline Events =====
        public static event Action<TimelineEntry> OnTimelineUpdated;

        // ===== Deduction Events =====
        public static event Action<bool, string> OnDeductionSubmitted; // isCorrect, explanation

        // ===== UI Events =====
        public static event Action<string> OnPanelRequested; // panelName
        public static event Action OnModalClosed;
        public static event Action<string, string> OnToastRequested; // message, type

        // ===== Case Events =====
        public static event Action<CaseData> OnCaseLoaded;
        public static event Action OnCaseCompleted;

        // ===== Trigger Methods =====
        public static void TriggerClueCollected(ClueData clue) => OnClueCollected?.Invoke(clue);
        public static void TriggerClueMarkedImportant(string clueId, bool isImportant) 
            => OnClueMarkedImportant?.Invoke(clueId, isImportant);
        public static void TriggerClueUnlocked(ClueData clue) => OnClueUnlocked?.Invoke(clue);

        public static void TriggerQuestionAsked(string suspectId, QuestionData question) 
            => OnQuestionAsked?.Invoke(suspectId, question);
        public static void TriggerQuestionUnlocked(string suspectId, QuestionData question) 
            => OnQuestionUnlocked?.Invoke(suspectId, question);

        public static void TriggerTimelineUpdated(TimelineEntry entry) 
            => OnTimelineUpdated?.Invoke(entry);

        public static void TriggerDeductionSubmitted(bool isCorrect, string explanation) 
            => OnDeductionSubmitted?.Invoke(isCorrect, explanation);

        public static void TriggerPanelRequested(string panelName) 
            => OnPanelRequested?.Invoke(panelName);
        public static void TriggerModalClosed() => OnModalClosed?.Invoke();
        public static void TriggerToast(string message, string type = "info") 
            => OnToastRequested?.Invoke(message, type);

        public static void TriggerCaseLoaded(CaseData caseData) 
            => OnCaseLoaded?.Invoke(caseData);
        public static void TriggerCaseCompleted() => OnCaseCompleted?.Invoke();

        /// <summary>
        /// Clear all event subscribers. Call when changing scenes or resetting.
        /// </summary>
        public static void ClearAllSubscriptions()
        {
            OnClueCollected = null;
            OnClueMarkedImportant = null;
            OnClueUnlocked = null;
            OnQuestionAsked = null;
            OnQuestionUnlocked = null;
            OnTimelineUpdated = null;
            OnDeductionSubmitted = null;
            OnPanelRequested = null;
            OnModalClosed = null;
            OnToastRequested = null;
            OnCaseLoaded = null;
            OnCaseCompleted = null;
        }
    }
}
