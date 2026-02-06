using System;
using System.Collections;
using UnityEngine;
using UnityEngine.UI;
using DetectiveGame.Models;
using DetectiveGame.Systems;

namespace DetectiveGame.Utils
{
    /// <summary>
    /// Hotspot view for interactive investigation scenes.
    /// Handles click detection and visual feedback.
    /// </summary>
    [RequireComponent(typeof(RectTransform))]
    public class HotspotView : MonoBehaviour
    {
        [Header("Visual")]
        [SerializeField] private Image hotspotImage;
        [SerializeField] private Image pulseImage;
        [SerializeField] private Color activeColor = new Color(1f, 0.9f, 0.4f, 0.8f);
        [SerializeField] private Color collectedColor = new Color(0.5f, 0.5f, 0.5f, 0.4f);

        [Header("Settings")]
        [SerializeField] private float pulseScale = 1.2f;
        [SerializeField] private float pulseDuration = 1f;

        public string HotspotId { get; private set; }
        public string ClueId { get; private set; }
        public string Label { get; private set; }

        private RectTransform _rectTransform;
        private Button _button;
        private bool _isCollected = false;
        private Coroutine _pulseCoroutine;

        public event Action<HotspotView> OnClicked;

        private void Awake()
        {
            _rectTransform = GetComponent<RectTransform>();
            _button = GetComponent<Button>();

            if (_button == null)
            {
                _button = gameObject.AddComponent<Button>();
            }

            _button.onClick.AddListener(HandleClick);
        }

        /// <summary>
        /// Initialize the hotspot with data.
        /// </summary>
        public void Initialize(HotspotData data)
        {
            HotspotId = data.hotspotId;
            ClueId = data.clueId;
            Label = data.label;

            // Position the hotspot
            // Note: x,y are normalized coordinates (0-1) mapped to parent container
            _rectTransform.anchorMin = new Vector2(data.x, data.y);
            _rectTransform.anchorMax = new Vector2(data.x, data.y);
            _rectTransform.anchoredPosition = Vector2.zero;

            // Start pulse animation
            StartPulse();

            Debug.Log($"[HotspotView] Initialized: {Label} at ({data.x}, {data.y})");
        }

        private void HandleClick()
        {
            if (_isCollected)
            {
                // Already collected, show toast
                EventBus.TriggerToast($"Đã thu thập: {Label}", "info");
                return;
            }

            OnClicked?.Invoke(this);
        }

        /// <summary>
        /// Set the collected state and update visuals.
        /// </summary>
        public void SetCollected(bool collected)
        {
            _isCollected = collected;

            if (hotspotImage != null)
            {
                hotspotImage.color = collected ? collectedColor : activeColor;
            }

            if (collected)
            {
                StopPulse();
            }
            else
            {
                StartPulse();
            }
        }

        private void StartPulse()
        {
            if (_pulseCoroutine != null || pulseImage == null) return;
            
            _pulseCoroutine = StartCoroutine(PulseAnimation());
        }

        private void StopPulse()
        {
            if (_pulseCoroutine != null)
            {
                StopCoroutine(_pulseCoroutine);
                _pulseCoroutine = null;
            }

            if (pulseImage != null)
            {
                pulseImage.transform.localScale = Vector3.one;
                pulseImage.color = new Color(pulseImage.color.r, pulseImage.color.g, pulseImage.color.b, 0f);
            }
        }

        private IEnumerator PulseAnimation()
        {
            if (pulseImage == null) yield break;

            while (true)
            {
                // Expand and fade out
                float elapsed = 0f;
                while (elapsed < pulseDuration)
                {
                    elapsed += Time.deltaTime;
                    float t = elapsed / pulseDuration;

                    float scale = Mathf.Lerp(1f, pulseScale, t);
                    pulseImage.transform.localScale = Vector3.one * scale;

                    float alpha = Mathf.Lerp(0.5f, 0f, t);
                    var color = pulseImage.color;
                    pulseImage.color = new Color(color.r, color.g, color.b, alpha);

                    yield return null;
                }

                // Reset
                pulseImage.transform.localScale = Vector3.one;

                // Small delay before next pulse
                yield return new WaitForSeconds(0.3f);
            }
        }

        private void OnDestroy()
        {
            StopPulse();
        }
    }
}
