using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;
using DetectiveGame.Models;
using DetectiveGame.Core;
using DetectiveGame.Systems;

namespace DetectiveGame.UI
{
    /// <summary>
    /// Panel for making final deduction/accusation.
    /// </summary>
    public class DeductionPanel : BasePanel
    {
        [Header("Deduction Dropdowns")]
        [SerializeField] private TMP_Dropdown killerDropdown;
        [SerializeField] private TMP_Dropdown motiveDropdown;
        [SerializeField] private TMP_Dropdown weaponDropdown;
        [SerializeField] private TMP_Dropdown keyEvidenceDropdown;

        [Header("Buttons")]
        [SerializeField] private Button submitButton;
        [SerializeField] private Button clearButton;

        [Header("Status")]
        [SerializeField] private TextMeshProUGUI statusText;

        private List<string> _suspectIds = new List<string>();
        private List<string> _motiveIds = new List<string>();
        private List<string> _weaponIds = new List<string>();
        private List<string> _keyEvidenceIds = new List<string>();

        protected override void Awake()
        {
            base.Awake();
        }

        private void OnEnable()
        {
            EventBus.OnCaseLoaded += HandleCaseLoaded;
        }

        private void OnDisable()
        {
            EventBus.OnCaseLoaded -= HandleCaseLoaded;
        }

        private void Start()
        {
            // Set up button listeners
            if (submitButton != null)
                submitButton.onClick.AddListener(OnSubmitClicked);
            if (clearButton != null)
                clearButton.onClick.AddListener(OnClearClicked);

            // Set up dropdown listeners
            if (killerDropdown != null)
                killerDropdown.onValueChanged.AddListener(OnKillerChanged);
            if (motiveDropdown != null)
                motiveDropdown.onValueChanged.AddListener(OnMotiveChanged);
            if (weaponDropdown != null)
                weaponDropdown.onValueChanged.AddListener(OnWeaponChanged);
            if (keyEvidenceDropdown != null)
                keyEvidenceDropdown.onValueChanged.AddListener(OnKeyEvidenceChanged);
        }

        private void HandleCaseLoaded(CaseData caseData)
        {
            PopulateDropdowns(caseData);
            LoadSavedSelections();
        }

        private void PopulateDropdowns(CaseData caseData)
        {
            // Populate Killer dropdown (suspects)
            if (killerDropdown != null && caseData.suspects != null)
            {
                killerDropdown.ClearOptions();
                var options = new List<string> { "-- Chọn hung thủ --" };
                _suspectIds.Clear();
                _suspectIds.Add("");

                foreach (var suspect in caseData.suspects)
                {
                    options.Add(suspect.name);
                    _suspectIds.Add(suspect.id);
                }
                killerDropdown.AddOptions(options);
            }

            // Populate Motive dropdown
            if (motiveDropdown != null && caseData.motives != null)
            {
                motiveDropdown.ClearOptions();
                var options = new List<string> { "-- Chọn động cơ --" };
                _motiveIds.Clear();
                _motiveIds.Add("");

                foreach (var motive in caseData.motives)
                {
                    options.Add(motive.text);
                    _motiveIds.Add(motive.id);
                }
                motiveDropdown.AddOptions(options);
            }

            // Populate Weapon dropdown
            if (weaponDropdown != null && caseData.weapons != null)
            {
                weaponDropdown.ClearOptions();
                var options = new List<string> { "-- Chọn vũ khí/phương thức --" };
                _weaponIds.Clear();
                _weaponIds.Add("");

                foreach (var weapon in caseData.weapons)
                {
                    options.Add(weapon.text);
                    _weaponIds.Add(weapon.id);
                }
                weaponDropdown.AddOptions(options);
            }

            // Populate Key Evidence dropdown
            if (keyEvidenceDropdown != null && caseData.deductionOptions?.keyEvidences != null)
            {
                keyEvidenceDropdown.ClearOptions();
                var options = new List<string> { "-- Chọn bằng chứng then chốt --" };
                _keyEvidenceIds.Clear();
                _keyEvidenceIds.Add("");

                foreach (var evidence in caseData.deductionOptions.keyEvidences)
                {
                    options.Add(evidence.text);
                    _keyEvidenceIds.Add(evidence.id);
                }
                keyEvidenceDropdown.AddOptions(options);
            }
        }

        private void LoadSavedSelections()
        {
            var selections = DeductionSystem.Instance?.GetSelections();
            if (selections == null) return;

            // Set dropdown values based on saved selections
            if (!string.IsNullOrEmpty(selections.selectedKillerId))
            {
                int index = _suspectIds.IndexOf(selections.selectedKillerId);
                if (index >= 0 && killerDropdown != null)
                    killerDropdown.value = index;
            }

            if (!string.IsNullOrEmpty(selections.selectedMotiveId))
            {
                int index = _motiveIds.IndexOf(selections.selectedMotiveId);
                if (index >= 0 && motiveDropdown != null)
                    motiveDropdown.value = index;
            }

            if (!string.IsNullOrEmpty(selections.selectedWeaponId))
            {
                int index = _weaponIds.IndexOf(selections.selectedWeaponId);
                if (index >= 0 && weaponDropdown != null)
                    weaponDropdown.value = index;
            }

            if (!string.IsNullOrEmpty(selections.selectedKeyEvidenceId))
            {
                int index = _keyEvidenceIds.IndexOf(selections.selectedKeyEvidenceId);
                if (index >= 0 && keyEvidenceDropdown != null)
                    keyEvidenceDropdown.value = index;
            }

            UpdateStatus();
        }

        private void OnKillerChanged(int index)
        {
            if (index > 0 && index < _suspectIds.Count)
            {
                DeductionSystem.Instance?.SetKiller(_suspectIds[index]);
            }
            UpdateStatus();
        }

        private void OnMotiveChanged(int index)
        {
            if (index > 0 && index < _motiveIds.Count)
            {
                DeductionSystem.Instance?.SetMotive(_motiveIds[index]);
            }
            UpdateStatus();
        }

        private void OnWeaponChanged(int index)
        {
            if (index > 0 && index < _weaponIds.Count)
            {
                DeductionSystem.Instance?.SetWeapon(_weaponIds[index]);
            }
            UpdateStatus();
        }

        private void OnKeyEvidenceChanged(int index)
        {
            if (index > 0 && index < _keyEvidenceIds.Count)
            {
                DeductionSystem.Instance?.SetKeyEvidence(_keyEvidenceIds[index]);
            }
            UpdateStatus();
        }

        private void OnSubmitClicked()
        {
            if (!DeductionSystem.Instance.IsComplete())
            {
                EventBus.TriggerToast("Vui lòng chọn đầy đủ tất cả các mục", "warning");
                return;
            }

            var (isCorrect, explanation) = DeductionSystem.Instance.SubmitDeduction();
            UIManager.Instance?.ShowResult(isCorrect, explanation);
        }

        private void OnClearClicked()
        {
            DeductionSystem.Instance?.ClearSelections();

            // Reset dropdowns
            if (killerDropdown != null) killerDropdown.value = 0;
            if (motiveDropdown != null) motiveDropdown.value = 0;
            if (weaponDropdown != null) weaponDropdown.value = 0;
            if (keyEvidenceDropdown != null) keyEvidenceDropdown.value = 0;

            UpdateStatus();
        }

        private void UpdateStatus()
        {
            if (statusText == null) return;

            bool isComplete = DeductionSystem.Instance?.IsComplete() ?? false;
            if (isComplete)
            {
                statusText.text = "✓ Sẵn sàng nộp suy luận";
                statusText.color = new Color(0.2f, 0.6f, 0.2f);
            }
            else
            {
                statusText.text = "Vui lòng chọn đầy đủ tất cả các mục";
                statusText.color = new Color(0.6f, 0.4f, 0.2f);
            }

            if (submitButton != null)
            {
                submitButton.interactable = isComplete;
            }
        }

        public override void Refresh()
        {
            var caseData = CaseLoader.Instance?.CurrentCase;
            if (caseData != null)
            {
                PopulateDropdowns(caseData);
                LoadSavedSelections();
            }
        }

        protected override void OnShown()
        {
            base.OnShown();
            Refresh();
        }
    }
}
