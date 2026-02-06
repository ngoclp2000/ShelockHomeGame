using System.Collections.Generic;
using UnityEngine;
using DetectiveGame.Models;
using DetectiveGame.Core;

namespace DetectiveGame.Systems
{
    /// <summary>
    /// Manages clue collection, importance marking, and clue-related queries.
    /// </summary>
    public class ClueSystem : MonoBehaviour
    {
        public static ClueSystem Instance { get; private set; }

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
        /// Collect a clue by its ID. Triggers events and saves progress.
        /// </summary>
        public bool CollectClue(string clueId)
        {
            if (SaveService.Instance.IsClueCollected(clueId))
            {
                Debug.Log($"[ClueSystem] Clue already collected: {clueId}");
                return false;
            }

            ClueData clue = CaseLoader.Instance.GetClue(clueId);
            if (clue == null)
            {
                Debug.LogError($"[ClueSystem] Clue not found: {clueId}");
                return false;
            }

            // Save progress
            SaveService.Instance.AddCollectedClue(clueId);

            // Add to timeline
            NotebookSystem.Instance?.AddClueFoundEntry(clue);

            // Fire event
            EventBus.TriggerClueCollected(clue);
            EventBus.TriggerToast($"Tìm thấy: {clue.name}", "success");

            Debug.Log($"[ClueSystem] Collected clue: {clue.name}");
            return true;
        }

        /// <summary>
        /// Toggle the importance flag for a clue.
        /// </summary>
        public void ToggleImportant(string clueId)
        {
            bool wasImportant = SaveService.Instance.IsClueImportant(clueId);
            SaveService.Instance.ToggleImportantClue(clueId);
            
            bool isNowImportant = !wasImportant;
            EventBus.TriggerClueMarkedImportant(clueId, isNowImportant);

            string status = isNowImportant ? "đánh dấu quan trọng" : "bỏ đánh dấu";
            Debug.Log($"[ClueSystem] Clue {clueId} {status}");
        }

        /// <summary>
        /// Get all collected clues as ClueData objects.
        /// </summary>
        public List<ClueData> GetCollectedClues()
        {
            var result = new List<ClueData>();
            var collectedIds = SaveService.Instance?.CurrentSave?.collectedClueIds;
            
            if (collectedIds == null) return result;

            foreach (var clueId in collectedIds)
            {
                var clue = CaseLoader.Instance.GetClue(clueId);
                if (clue != null)
                {
                    result.Add(clue);
                }
            }

            return result;
        }

        /// <summary>
        /// Get all important clues.
        /// </summary>
        public List<ClueData> GetImportantClues()
        {
            var result = new List<ClueData>();
            var importantIds = SaveService.Instance?.CurrentSave?.importantClueIds;

            if (importantIds == null) return result;

            foreach (var clueId in importantIds)
            {
                var clue = CaseLoader.Instance.GetClue(clueId);
                if (clue != null)
                {
                    result.Add(clue);
                }
            }

            return result;
        }

        /// <summary>
        /// Check if a clue is collected.
        /// </summary>
        public bool IsCollected(string clueId)
        {
            return SaveService.Instance.IsClueCollected(clueId);
        }

        /// <summary>
        /// Check if a clue is marked as important.
        /// </summary>
        public bool IsImportant(string clueId)
        {
            return SaveService.Instance.IsClueImportant(clueId);
        }

        /// <summary>
        /// Get count of new (unchecked) clues for badge display.
        /// </summary>
        public int GetNewClueCount()
        {
            // For MVP, we could track "viewed" clues separately
            // For now, return 0 or implement simple tracking
            return 0;
        }
    }
}
