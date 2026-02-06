using UnityEngine;
using UnityEngine.UI;
using TMPro;
using DetectiveGame.Models;
using DetectiveGame.Core;
using DetectiveGame.Systems;

namespace DetectiveGame.UI
{
    /// <summary>
    /// Modal showing clue details with mark important and add to deduction options.
    /// </summary>
    public class ClueDetailModal : BaseModal
    {
        [Header("Content")]
        [SerializeField] private TextMeshProUGUI titleText;
        [SerializeField] private TextMeshProUGUI descriptionText;
        [SerializeField] private Image clueImage;
        [SerializeField] private TextMeshProUGUI tagsText;

        [Header("Buttons")]
        [SerializeField] private Button closeButton;
        [SerializeField] private Button markImportantButton;
        [SerializeField] private TextMeshProUGUI importantButtonText;
        [SerializeField] private Image starIcon;

        private string _currentClueId;

        protected override void Awake()
        {
            base.Awake();

            if (closeButton != null)
                closeButton.onClick.AddListener(Close);

            if (markImportantButton != null)
                markImportantButton.onClick.AddListener(OnMarkImportantClicked);
        }

        public override void SetData(object data)
        {
            _currentClueId = data as string;
            if (string.IsNullOrEmpty(_currentClueId)) return;

            ClueData clue = CaseLoader.Instance?.GetClue(_currentClueId);
            if (clue == null) return;

            // Update UI
            if (titleText != null)
                titleText.text = clue.name;

            if (descriptionText != null)
                descriptionText.text = clue.description;

            if (clueImage != null && !string.IsNullOrEmpty(clue.spritePath))
            {
                Sprite sprite = Resources.Load<Sprite>(clue.spritePath);
                if (sprite != null)
                    clueImage.sprite = sprite;
            }

            if (tagsText != null && clue.tags != null && clue.tags.Count > 0)
            {
                tagsText.text = string.Join(" • ", clue.tags);
                tagsText.gameObject.SetActive(true);
            }
            else if (tagsText != null)
            {
                tagsText.gameObject.SetActive(false);
            }

            UpdateImportantButton();
        }

        private void OnMarkImportantClicked()
        {
            ClueSystem.Instance?.ToggleImportant(_currentClueId);
            UpdateImportantButton();
        }

        private void UpdateImportantButton()
        {
            bool isImportant = ClueSystem.Instance?.IsImportant(_currentClueId) ?? false;

            if (importantButtonText != null)
            {
                importantButtonText.text = isImportant ? "Bỏ đánh dấu ⭐" : "Đánh dấu quan trọng ⭐";
            }

            if (starIcon != null)
            {
                starIcon.color = isImportant 
                    ? new Color(1f, 0.8f, 0.2f) // Gold 
                    : new Color(0.5f, 0.5f, 0.5f); // Gray
            }
        }

        protected override void OnHidden()
        {
            base.OnHidden();
            _currentClueId = null;
        }
    }
}
