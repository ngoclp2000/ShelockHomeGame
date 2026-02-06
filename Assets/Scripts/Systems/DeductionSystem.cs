using UnityEngine;
using DetectiveGame.Models;
using DetectiveGame.Core;

namespace DetectiveGame.Systems
{
    /// <summary>
    /// Manages the deduction/accusation system for solving the case.
    /// </summary>
    public class DeductionSystem : MonoBehaviour
    {
        public static DeductionSystem Instance { get; private set; }

        // Current selections
        private string _selectedKillerId;
        private string _selectedMotiveId;
        private string _selectedWeaponId;
        private string _selectedKeyEvidenceId;

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

        private void Start()
        {
            // Load any saved selections
            LoadSelections();
        }

        /// <summary>
        /// Set the suspected killer.
        /// </summary>
        public void SetKiller(string suspectId)
        {
            _selectedKillerId = suspectId;
            SaveSelections();
            Debug.Log($"[DeductionSystem] Killer set: {suspectId}");
        }

        /// <summary>
        /// Set the suspected motive.
        /// </summary>
        public void SetMotive(string motiveId)
        {
            _selectedMotiveId = motiveId;
            SaveSelections();
            Debug.Log($"[DeductionSystem] Motive set: {motiveId}");
        }

        /// <summary>
        /// Set the suspected weapon.
        /// </summary>
        public void SetWeapon(string weaponId)
        {
            _selectedWeaponId = weaponId;
            SaveSelections();
            Debug.Log($"[DeductionSystem] Weapon set: {weaponId}");
        }

        /// <summary>
        /// Set the key evidence.
        /// </summary>
        public void SetKeyEvidence(string keyEvidenceId)
        {
            _selectedKeyEvidenceId = keyEvidenceId;
            SaveSelections();
            Debug.Log($"[DeductionSystem] Key evidence set: {keyEvidenceId}");
        }

        /// <summary>
        /// Get current selections.
        /// </summary>
        public DeductionSelections GetSelections()
        {
            return new DeductionSelections
            {
                selectedKillerId = _selectedKillerId,
                selectedMotiveId = _selectedMotiveId,
                selectedWeaponId = _selectedWeaponId,
                selectedKeyEvidenceId = _selectedKeyEvidenceId
            };
        }

        /// <summary>
        /// Check if all selections have been made.
        /// </summary>
        public bool IsComplete()
        {
            return !string.IsNullOrEmpty(_selectedKillerId) &&
                   !string.IsNullOrEmpty(_selectedMotiveId) &&
                   !string.IsNullOrEmpty(_selectedWeaponId) &&
                   !string.IsNullOrEmpty(_selectedKeyEvidenceId);
        }

        /// <summary>
        /// Submit the deduction and check against the solution.
        /// Returns a tuple of (isCorrect, explanation).
        /// </summary>
        public (bool isCorrect, string explanation) SubmitDeduction()
        {
            if (!IsComplete())
            {
                return (false, "Vui lòng chọn đầy đủ tất cả các mục trước khi nộp.");
            }

            var solution = CaseLoader.Instance.CurrentCase.solution;
            
            bool killerCorrect = _selectedKillerId == solution.killerId;
            bool motiveCorrect = _selectedMotiveId == solution.motiveId;
            bool weaponCorrect = _selectedWeaponId == solution.weaponId;
            bool evidenceCorrect = _selectedKeyEvidenceId == solution.keyEvidenceId;

            bool isCorrect = killerCorrect && motiveCorrect && weaponCorrect && evidenceCorrect;

            string explanation;
            if (isCorrect)
            {
                explanation = solution.explanation;
                EventBus.TriggerCaseCompleted();
            }
            else
            {
                // Build partial feedback
                explanation = BuildFeedback(killerCorrect, motiveCorrect, weaponCorrect, evidenceCorrect);
            }

            // Add to timeline
            NotebookSystem.Instance?.AddDeductionEntry(isCorrect, explanation);

            // Fire event
            EventBus.TriggerDeductionSubmitted(isCorrect, explanation);

            Debug.Log($"[DeductionSystem] Deduction submitted. Correct: {isCorrect}");
            return (isCorrect, explanation);
        }

        private string BuildFeedback(bool killer, bool motive, bool weapon, bool evidence)
        {
            var feedback = new System.Text.StringBuilder();
            feedback.AppendLine("Suy luận chưa hoàn toàn chính xác:");
            
            if (!killer) feedback.AppendLine("• Hung thủ chưa đúng");
            if (!motive) feedback.AppendLine("• Động cơ chưa đúng");
            if (!weapon) feedback.AppendLine("• Vũ khí/phương thức chưa đúng");
            if (!evidence) feedback.AppendLine("• Bằng chứng then chốt chưa đúng");

            int correctCount = (killer ? 1 : 0) + (motive ? 1 : 0) + (weapon ? 1 : 0) + (evidence ? 1 : 0);
            feedback.AppendLine($"\nĐúng {correctCount}/4 mục. Hãy xem xét lại các manh mối.");

            return feedback.ToString();
        }

        private void SaveSelections()
        {
            if (SaveService.Instance?.CurrentSave == null) return;

            SaveService.Instance.CurrentSave.deductionSelections = new DeductionSelections
            {
                selectedKillerId = _selectedKillerId,
                selectedMotiveId = _selectedMotiveId,
                selectedWeaponId = _selectedWeaponId,
                selectedKeyEvidenceId = _selectedKeyEvidenceId
            };
            SaveService.Instance.Save();
        }

        private void LoadSelections()
        {
            var selections = SaveService.Instance?.CurrentSave?.deductionSelections;
            if (selections != null)
            {
                _selectedKillerId = selections.selectedKillerId;
                _selectedMotiveId = selections.selectedMotiveId;
                _selectedWeaponId = selections.selectedWeaponId;
                _selectedKeyEvidenceId = selections.selectedKeyEvidenceId;
            }
        }

        /// <summary>
        /// Clear all selections (for retry).
        /// </summary>
        public void ClearSelections()
        {
            _selectedKillerId = null;
            _selectedMotiveId = null;
            _selectedWeaponId = null;
            _selectedKeyEvidenceId = null;
            SaveSelections();
        }
    }
}
