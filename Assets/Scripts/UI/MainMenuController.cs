using UnityEngine;
using UnityEngine.UI;
using TMPro;
using DetectiveGame.Core;

namespace DetectiveGame.UI
{
    /// <summary>
    /// Main menu controller for starting/continuing cases.
    /// </summary>
    public class MainMenuController : MonoBehaviour
    {
        [Header("UI References")]
        [SerializeField] private Button startNewButton;
        [SerializeField] private Button continueButton;
        [SerializeField] private TextMeshProUGUI titleText;
        [SerializeField] private TextMeshProUGUI versionText;

        [Header("Settings")]
        [SerializeField] private string defaultCaseId = "case_001";

        private void Start()
        {
            // Setup button listeners
            if (startNewButton != null)
                startNewButton.onClick.AddListener(OnStartNewClicked);

            if (continueButton != null)
                continueButton.onClick.AddListener(OnContinueClicked);

            // Update UI
            UpdateContinueButton();

            if (versionText != null)
                versionText.text = $"v{Application.version}";
        }

        private void OnStartNewClicked()
        {
            // Find GameBootstrap or use SceneRouter directly
            var bootstrap = FindObjectOfType<GameBootstrap>();
            if (bootstrap != null)
            {
                bootstrap.StartNewCase(defaultCaseId);
            }
            else
            {
                // Direct approach
                SaveService.Instance?.ClearProgress(defaultCaseId);
                SceneRouter.Instance?.StartCase(defaultCaseId);
            }
        }

        private void OnContinueClicked()
        {
            var bootstrap = FindObjectOfType<GameBootstrap>();
            if (bootstrap != null)
            {
                bootstrap.ContinueCase();
            }
            else
            {
                SceneRouter.Instance?.ContinueLastCase();
            }
        }

        private void UpdateContinueButton()
        {
            if (continueButton == null) return;

            // Check if there's a save to continue
            var bootstrap = FindObjectOfType<GameBootstrap>();
            bool hasSave = bootstrap?.HasContinuableCase() ?? 
                           (SaveService.Instance != null && 
                            !string.IsNullOrEmpty(SaveService.Instance.GetLastCaseId()));

            continueButton.interactable = hasSave;

            // Update button text
            var buttonText = continueButton.GetComponentInChildren<TextMeshProUGUI>();
            if (buttonText != null)
            {
                buttonText.text = hasSave ? "Tiếp tục" : "Tiếp tục (Không có lưu)";
                buttonText.color = hasSave ? Color.white : new Color(0.5f, 0.5f, 0.5f);
            }
        }
    }
}
