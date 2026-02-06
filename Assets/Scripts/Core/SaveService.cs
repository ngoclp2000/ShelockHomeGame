using UnityEngine;
using DetectiveGame.Models;

namespace DetectiveGame.Core
{
    /// <summary>
    /// Handles saving and loading player progress using PlayerPrefs.
    /// Data is serialized to JSON for easy upgrade to file-based saves later.
    /// </summary>
    public class SaveService : MonoBehaviour
    {
        public static SaveService Instance { get; private set; }

        private const string SAVE_KEY_PREFIX = "DetectiveGame_Save_";
        private const string LAST_CASE_KEY = "DetectiveGame_LastCase";

        public SaveData CurrentSave { get; private set; }

        private void Awake()
        {
            if (Instance == null)
            {
                Instance = this;
                DontDestroyOnLoad(gameObject);
            }
            else
            {
                Destroy(gameObject);
            }
        }

        /// <summary>
        /// Load save data for a specific case. Creates new save if none exists.
        /// </summary>
        public SaveData Load(string caseId)
        {
            string key = SAVE_KEY_PREFIX + caseId;
            
            if (PlayerPrefs.HasKey(key))
            {
                string json = PlayerPrefs.GetString(key);
                CurrentSave = JsonUtility.FromJson<SaveData>(json);
                Debug.Log($"[SaveService] Loaded save for case: {caseId}");
            }
            else
            {
                CurrentSave = CreateNewSave(caseId);
                Debug.Log($"[SaveService] Created new save for case: {caseId}");
            }

            PlayerPrefs.SetString(LAST_CASE_KEY, caseId);
            PlayerPrefs.Save();
            
            return CurrentSave;
        }

        /// <summary>
        /// Save current progress.
        /// </summary>
        public void Save()
        {
            if (CurrentSave == null)
            {
                Debug.LogWarning("[SaveService] No current save to persist.");
                return;
            }

            string key = SAVE_KEY_PREFIX + CurrentSave.caseId;
            string json = JsonUtility.ToJson(CurrentSave);
            PlayerPrefs.SetString(key, json);
            PlayerPrefs.Save();
            
            Debug.Log($"[SaveService] Saved progress for case: {CurrentSave.caseId}");
        }

        /// <summary>
        /// Clear progress for a specific case.
        /// </summary>
        public void ClearProgress(string caseId)
        {
            string key = SAVE_KEY_PREFIX + caseId;
            PlayerPrefs.DeleteKey(key);
            PlayerPrefs.Save();
            
            if (CurrentSave?.caseId == caseId)
            {
                CurrentSave = null;
            }
            
            Debug.Log($"[SaveService] Cleared progress for case: {caseId}");
        }

        /// <summary>
        /// Get the last played case ID.
        /// </summary>
        public string GetLastCaseId()
        {
            return PlayerPrefs.GetString(LAST_CASE_KEY, null);
        }

        /// <summary>
        /// Check if a save exists for a case.
        /// </summary>
        public bool HasSave(string caseId)
        {
            return PlayerPrefs.HasKey(SAVE_KEY_PREFIX + caseId);
        }

        private SaveData CreateNewSave(string caseId)
        {
            var save = new SaveData
            {
                caseId = caseId,
                currentSceneIndex = 0
            };

            // Add initial timeline entry
            save.timelineEntries.Add(new TimelineEntry
            {
                type = TimelineEntryType.CaseStarted,
                description = "Bắt đầu điều tra vụ án",
                timestamp = System.DateTime.Now.ToString("HH:mm dd/MM"),
                relatedId = caseId
            });

            return save;
        }

        // ===== Helper methods for common save operations =====

        public void AddCollectedClue(string clueId)
        {
            if (CurrentSave != null && !CurrentSave.collectedClueIds.Contains(clueId))
            {
                CurrentSave.collectedClueIds.Add(clueId);
                Save();
            }
        }

        public void ToggleImportantClue(string clueId)
        {
            if (CurrentSave == null) return;

            if (CurrentSave.importantClueIds.Contains(clueId))
            {
                CurrentSave.importantClueIds.Remove(clueId);
            }
            else
            {
                CurrentSave.importantClueIds.Add(clueId);
            }
            Save();
        }

        public void AddAskedQuestion(string questionId)
        {
            if (CurrentSave != null && !CurrentSave.askedQuestionIds.Contains(questionId))
            {
                CurrentSave.askedQuestionIds.Add(questionId);
                Save();
            }
        }

        public void AddUnlockedQuestion(string questionId)
        {
            if (CurrentSave != null && !CurrentSave.unlockedQuestionIds.Contains(questionId))
            {
                CurrentSave.unlockedQuestionIds.Add(questionId);
                Save();
            }
        }

        public void AddTimelineEntry(TimelineEntry entry)
        {
            if (CurrentSave != null)
            {
                CurrentSave.timelineEntries.Add(entry);
                Save();
            }
        }

        public bool IsClueCollected(string clueId)
        {
            return CurrentSave?.collectedClueIds.Contains(clueId) ?? false;
        }

        public bool IsClueImportant(string clueId)
        {
            return CurrentSave?.importantClueIds.Contains(clueId) ?? false;
        }

        public bool IsQuestionAsked(string questionId)
        {
            return CurrentSave?.askedQuestionIds.Contains(questionId) ?? false;
        }
    }
}
