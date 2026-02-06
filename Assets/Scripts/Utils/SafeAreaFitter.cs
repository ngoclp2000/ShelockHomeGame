using UnityEngine;

namespace DetectiveGame.Utils
{
    /// <summary>
    /// Automatically adjusts RectTransform to fit within the device safe area.
    /// Handles notches, home indicators, and rounded corners on modern devices.
    /// </summary>
    [RequireComponent(typeof(RectTransform))]
    public class SafeAreaFitter : MonoBehaviour
    {
        [Header("Settings")]
        [SerializeField] private bool fitTop = true;
        [SerializeField] private bool fitBottom = true;
        [SerializeField] private bool fitLeft = true;
        [SerializeField] private bool fitRight = true;

        private RectTransform _rectTransform;
        private Rect _lastSafeArea = Rect.zero;
        private Vector2Int _lastScreenSize = Vector2Int.zero;
        private ScreenOrientation _lastOrientation = ScreenOrientation.AutoRotation;

        private void Awake()
        {
            _rectTransform = GetComponent<RectTransform>();
        }

        private void Start()
        {
            ApplySafeArea();
        }

        private void Update()
        {
            // Check if safe area or screen size changed
            if (_lastSafeArea != Screen.safeArea ||
                _lastScreenSize.x != Screen.width ||
                _lastScreenSize.y != Screen.height ||
                _lastOrientation != Screen.orientation)
            {
                ApplySafeArea();
            }
        }

        private void ApplySafeArea()
        {
            Rect safeArea = Screen.safeArea;
            
            // Cache current values
            _lastSafeArea = safeArea;
            _lastScreenSize = new Vector2Int(Screen.width, Screen.height);
            _lastOrientation = Screen.orientation;

            // If no safe area defined, use full screen
            if (safeArea.width <= 0 || safeArea.height <= 0)
            {
                safeArea = new Rect(0, 0, Screen.width, Screen.height);
            }

            // Calculate anchor values (0 to 1)
            Vector2 anchorMin = safeArea.position;
            Vector2 anchorMax = safeArea.position + safeArea.size;

            anchorMin.x /= Screen.width;
            anchorMin.y /= Screen.height;
            anchorMax.x /= Screen.width;
            anchorMax.y /= Screen.height;

            // Apply based on settings
            if (!fitLeft) anchorMin.x = 0f;
            if (!fitRight) anchorMax.x = 1f;
            if (!fitBottom) anchorMin.y = 0f;
            if (!fitTop) anchorMax.y = 1f;

            // Clamp values
            anchorMin.x = Mathf.Clamp01(anchorMin.x);
            anchorMin.y = Mathf.Clamp01(anchorMin.y);
            anchorMax.x = Mathf.Clamp01(anchorMax.x);
            anchorMax.y = Mathf.Clamp01(anchorMax.y);

            // Apply to RectTransform
            _rectTransform.anchorMin = anchorMin;
            _rectTransform.anchorMax = anchorMax;
            _rectTransform.offsetMin = Vector2.zero;
            _rectTransform.offsetMax = Vector2.zero;

            Debug.Log($"[SafeAreaFitter] Applied safe area: {safeArea} -> anchors ({anchorMin}, {anchorMax})");
        }

        /// <summary>
        /// Force recalculation of safe area.
        /// </summary>
        public void Refresh()
        {
            _lastSafeArea = Rect.zero; // Force update
            ApplySafeArea();
        }

#if UNITY_EDITOR
        // Simulate safe areas in editor for testing
        [Header("Editor Testing")]
        [SerializeField] private bool simulateSafeArea = false;
        [SerializeField] private Vector4 simulatedInsets = new Vector4(0, 44, 0, 34); // left, top, right, bottom

        private void OnValidate()
        {
            if (simulateSafeArea && Application.isPlaying)
            {
                ApplySafeArea();
            }
        }
#endif
    }
}
