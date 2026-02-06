using System.Collections;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

namespace DetectiveGame.UI
{
    /// <summary>
    /// Toast popup for quick notifications.
    /// </summary>
    public class ToastPopup : MonoBehaviour
    {
        [Header("UI References")]
        [SerializeField] private RectTransform container;
        [SerializeField] private CanvasGroup canvasGroup;
        [SerializeField] private TextMeshProUGUI messageText;
        [SerializeField] private Image iconImage;
        [SerializeField] private Image backgroundImage;

        [Header("Type Colors")]
        [SerializeField] private Color infoColor = new Color(0.2f, 0.4f, 0.6f);
        [SerializeField] private Color successColor = new Color(0.2f, 0.6f, 0.3f);
        [SerializeField] private Color warningColor = new Color(0.8f, 0.6f, 0.2f);
        [SerializeField] private Color errorColor = new Color(0.8f, 0.3f, 0.2f);

        [Header("Settings")]
        [SerializeField] private float displayDuration = 2.5f;
        [SerializeField] private float fadeDuration = 0.3f;

        private Coroutine _currentRoutine;

        private void Awake()
        {
            if (canvasGroup == null)
                canvasGroup = GetComponent<CanvasGroup>();
            if (container == null)
                container = GetComponent<RectTransform>();

            // Start hidden
            gameObject.SetActive(false);
        }

        /// <summary>
        /// Show a toast notification.
        /// </summary>
        public void Show(string message, string type = "info")
        {
            // Stop any existing routine
            if (_currentRoutine != null)
            {
                StopCoroutine(_currentRoutine);
            }

            // Update content
            if (messageText != null)
                messageText.text = message;

            // Set color based on type
            Color bgColor = GetColorForType(type);
            if (backgroundImage != null)
                backgroundImage.color = bgColor;

            // Start display routine
            _currentRoutine = StartCoroutine(DisplayRoutine());
        }

        private IEnumerator DisplayRoutine()
        {
            // Show
            gameObject.SetActive(true);
            
            // Fade in
            if (canvasGroup != null)
            {
                canvasGroup.alpha = 0f;
                float elapsed = 0f;
                while (elapsed < fadeDuration)
                {
                    elapsed += Time.deltaTime;
                    canvasGroup.alpha = elapsed / fadeDuration;
                    yield return null;
                }
                canvasGroup.alpha = 1f;
            }

            // Slide in animation
            if (container != null)
            {
                yield return UIAnimations.SlideInFromBottom(container, 0.2f);
            }

            // Wait
            yield return new WaitForSeconds(displayDuration);

            // Fade out
            if (canvasGroup != null)
            {
                float elapsed = 0f;
                while (elapsed < fadeDuration)
                {
                    elapsed += Time.deltaTime;
                    canvasGroup.alpha = 1f - (elapsed / fadeDuration);
                    yield return null;
                }
                canvasGroup.alpha = 0f;
            }

            // Hide
            gameObject.SetActive(false);
            _currentRoutine = null;
        }

        private Color GetColorForType(string type)
        {
            switch (type.ToLower())
            {
                case "success": return successColor;
                case "warning": return warningColor;
                case "error": return errorColor;
                case "info":
                default: return infoColor;
            }
        }

        /// <summary>
        /// Hide the toast immediately.
        /// </summary>
        public void Hide()
        {
            if (_currentRoutine != null)
            {
                StopCoroutine(_currentRoutine);
                _currentRoutine = null;
            }
            gameObject.SetActive(false);
        }
    }
}
