using UnityEngine;
using UnityEngine.UI;
using TMPro;
using DetectiveGame.Core;

namespace DetectiveGame.UI
{
    /// <summary>
    /// Modal showing deduction result (correct/incorrect).
    /// </summary>
    public class ResultModal : BaseModal
    {
        [Header("Content")]
        [SerializeField] private TextMeshProUGUI titleText;
        [SerializeField] private TextMeshProUGUI explanationText;
        [SerializeField] private Image resultIcon;

        [Header("Icons")]
        [SerializeField] private Sprite correctIcon;
        [SerializeField] private Sprite incorrectIcon;

        [Header("Colors")]
        [SerializeField] private Color correctColor = new Color(0.2f, 0.7f, 0.3f);
        [SerializeField] private Color incorrectColor = new Color(0.8f, 0.3f, 0.2f);

        [Header("Buttons")]
        [SerializeField] private Button closeButton;
        [SerializeField] private Button retryButton;
        [SerializeField] private Button mainMenuButton;

        private bool _isCorrect;

        protected override void Awake()
        {
            base.Awake();

            if (closeButton != null)
                closeButton.onClick.AddListener(Close);

            if (retryButton != null)
                retryButton.onClick.AddListener(OnRetryClicked);

            if (mainMenuButton != null)
                mainMenuButton.onClick.AddListener(OnMainMenuClicked);
        }

        public override void SetData(object data)
        {
            if (data is ResultData resultData)
            {
                _isCorrect = resultData.isCorrect;

                // Update UI based on result
                if (titleText != null)
                {
                    titleText.text = _isCorrect ? "🎉 Phá án thành công!" : "❌ Chưa chính xác";
                    titleText.color = _isCorrect ? correctColor : incorrectColor;
                }

                if (explanationText != null)
                {
                    explanationText.text = resultData.explanation;
                }

                if (resultIcon != null)
                {
                    resultIcon.sprite = _isCorrect ? correctIcon : incorrectIcon;
                    resultIcon.color = _isCorrect ? correctColor : incorrectColor;
                }

                // Show/hide buttons based on result
                if (retryButton != null)
                    retryButton.gameObject.SetActive(!_isCorrect);

                if (mainMenuButton != null)
                    mainMenuButton.gameObject.SetActive(_isCorrect);
            }
        }

        private void OnRetryClicked()
        {
            Close();
            // Stay in deduction panel to retry
        }

        private void OnMainMenuClicked()
        {
            Close();
            SceneRouter.Instance?.GoToMainMenu();
        }

        protected override void OnHidden()
        {
            base.OnHidden();
        }
    }
}
