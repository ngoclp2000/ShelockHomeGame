using System.Collections.Generic;
using UnityEngine;
using DetectiveGame.Models;
using DetectiveGame.Core;

namespace DetectiveGame.Systems
{
    /// <summary>
    /// Manages dialogue interactions with suspects, question unlocking, and answer processing.
    /// </summary>
    public class DialogueSystem : MonoBehaviour
    {
        public static DialogueSystem Instance { get; private set; }

        private void Awake()
        {
            if (Instance == null)
            {
                Instance = this;
            }
            else
            {
                Destroy(gameObject);
            }
        }

        /// <summary>
        /// Ask a question to a suspect and process the answer.
        /// </summary>
        public string AskQuestion(string suspectId, string questionId)
        {
            // Check if already asked
            if (SaveService.Instance.IsQuestionAsked(questionId))
            {
                Debug.Log($"[DialogueSystem] Question already asked: {questionId}");
                // Still return the answer for display
            }

            // Find suspect and question
            SuspectData suspect = CaseLoader.Instance.GetSuspect(suspectId);
            if (suspect == null)
            {
                Debug.LogError($"[DialogueSystem] Suspect not found: {suspectId}");
                return null;
            }

            QuestionData question = suspect.questions?.Find(q => q.id == questionId);
            if (question == null)
            {
                Debug.LogError($"[DialogueSystem] Question not found: {questionId}");
                return null;
            }

            // Mark as asked
            SaveService.Instance.AddAskedQuestion(questionId);

            // Add to timeline
            NotebookSystem.Instance?.AddQuestionAskedEntry(suspect, question);

            // Process unlocks
            ProcessUnlocks(suspectId, question);

            // Fire event
            EventBus.TriggerQuestionAsked(suspectId, question);

            Debug.Log($"[DialogueSystem] Asked question to {suspect.name}: {question.text}");
            return question.answer;
        }

        private void ProcessUnlocks(string suspectId, QuestionData question)
        {
            if (question.unlocks == null) return;

            // Unlock new questions
            if (question.unlocks.questions != null)
            {
                foreach (var qId in question.unlocks.questions)
                {
                    if (!SaveService.Instance.CurrentSave.unlockedQuestionIds.Contains(qId))
                    {
                        SaveService.Instance.AddUnlockedQuestion(qId);
                        
                        // Find the question data for the event
                        var suspect = CaseLoader.Instance.GetSuspect(suspectId);
                        var unlockedQ = suspect?.questions?.Find(q => q.id == qId);
                        
                        // Also check other suspects for the unlocked question
                        if (unlockedQ == null)
                        {
                            foreach (var s in CaseLoader.Instance.CurrentCase.suspects)
                            {
                                unlockedQ = s.questions?.Find(q => q.id == qId);
                                if (unlockedQ != null)
                                {
                                    suspectId = s.id;
                                    break;
                                }
                            }
                        }

                        if (unlockedQ != null)
                        {
                            EventBus.TriggerQuestionUnlocked(suspectId, unlockedQ);
                            EventBus.TriggerToast("Câu hỏi mới được mở khóa!", "info");
                        }
                    }
                }
            }

            // Unlock new clues
            if (question.unlocks.clues != null)
            {
                foreach (var clueId in question.unlocks.clues)
                {
                    ClueData clue = CaseLoader.Instance.GetClue(clueId);
                    if (clue != null && !SaveService.Instance.IsClueCollected(clueId))
                    {
                        SaveService.Instance.AddCollectedClue(clueId);
                        EventBus.TriggerClueUnlocked(clue);
                        EventBus.TriggerToast($"Manh mối mới: {clue.name}", "success");
                    }
                }
            }
        }

        /// <summary>
        /// Get available questions for a suspect (initial + unlocked, excluding asked).
        /// </summary>
        public List<QuestionData> GetAvailableQuestions(string suspectId)
        {
            var result = new List<QuestionData>();
            SuspectData suspect = CaseLoader.Instance.GetSuspect(suspectId);
            
            if (suspect?.questions == null) return result;

            foreach (var question in suspect.questions)
            {
                // Check if this is an initial question or has been unlocked
                bool isAvailable = IsQuestionAvailable(question.id);
                
                if (isAvailable)
                {
                    result.Add(question);
                }
            }

            return result;
        }

        /// <summary>
        /// Check if a question is available (initial or unlocked).
        /// </summary>
        public bool IsQuestionAvailable(string questionId)
        {
            // Initial questions (those not requiring unlock) are always available
            // For MVP, we'll mark initial questions by checking if any other question unlocks them
            var save = SaveService.Instance.CurrentSave;
            
            // If explicitly unlocked, it's available
            if (save.unlockedQuestionIds.Contains(questionId))
            {
                return true;
            }

            // Check if this question is unlocked by any other question
            // If not, it's an initial question
            bool isUnlockedByOther = false;
            foreach (var suspect in CaseLoader.Instance.CurrentCase.suspects)
            {
                foreach (var q in suspect.questions)
                {
                    if (q.unlocks?.questions?.Contains(questionId) == true)
                    {
                        isUnlockedByOther = true;
                        break;
                    }
                }
                if (isUnlockedByOther) break;
            }

            // If no other question unlocks this, it's an initial question
            return !isUnlockedByOther;
        }

        /// <summary>
        /// Check if a question has been asked.
        /// </summary>
        public bool IsQuestionAsked(string questionId)
        {
            return SaveService.Instance.IsQuestionAsked(questionId);
        }
    }
}
