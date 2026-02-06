using System.Collections;
using UnityEngine;

namespace DetectiveGame.UI
{
    /// <summary>
    /// Coroutine-based UI animations. No external dependencies (DOTween not required).
    /// </summary>
    public static class UIAnimations
    {
        public enum EaseType
        {
            Linear,
            EaseIn,
            EaseOut,
            EaseInOut
        }

        /// <summary>
        /// Slide a RectTransform in from bottom.
        /// </summary>
        public static IEnumerator SlideInFromBottom(RectTransform target, float duration = 0.3f, EaseType ease = EaseType.EaseOut)
        {
            Vector2 startPos = new Vector2(target.anchoredPosition.x, -target.rect.height);
            Vector2 endPos = new Vector2(target.anchoredPosition.x, 0);

            target.anchoredPosition = startPos;
            target.gameObject.SetActive(true);

            yield return AnimatePosition(target, startPos, endPos, duration, ease);
        }

        /// <summary>
        /// Slide a RectTransform out to bottom.
        /// </summary>
        public static IEnumerator SlideOutToBottom(RectTransform target, float duration = 0.25f, EaseType ease = EaseType.EaseIn)
        {
            Vector2 startPos = target.anchoredPosition;
            Vector2 endPos = new Vector2(target.anchoredPosition.x, -target.rect.height);

            yield return AnimatePosition(target, startPos, endPos, duration, ease);
            target.gameObject.SetActive(false);
        }

        /// <summary>
        /// Slide in from left.
        /// </summary>
        public static IEnumerator SlideInFromLeft(RectTransform target, float duration = 0.3f, EaseType ease = EaseType.EaseOut)
        {
            Vector2 startPos = new Vector2(-target.rect.width, target.anchoredPosition.y);
            Vector2 endPos = new Vector2(0, target.anchoredPosition.y);

            target.anchoredPosition = startPos;
            target.gameObject.SetActive(true);

            yield return AnimatePosition(target, startPos, endPos, duration, ease);
        }

        /// <summary>
        /// Fade in a CanvasGroup.
        /// </summary>
        public static IEnumerator FadeIn(CanvasGroup canvasGroup, float duration = 0.2f)
        {
            canvasGroup.alpha = 0f;
            canvasGroup.gameObject.SetActive(true);

            float elapsed = 0f;
            while (elapsed < duration)
            {
                elapsed += Time.deltaTime;
                canvasGroup.alpha = Mathf.Clamp01(elapsed / duration);
                yield return null;
            }

            canvasGroup.alpha = 1f;
            canvasGroup.interactable = true;
            canvasGroup.blocksRaycasts = true;
        }

        /// <summary>
        /// Fade out a CanvasGroup.
        /// </summary>
        public static IEnumerator FadeOut(CanvasGroup canvasGroup, float duration = 0.2f, bool deactivate = true)
        {
            canvasGroup.interactable = false;
            canvasGroup.blocksRaycasts = false;

            float startAlpha = canvasGroup.alpha;
            float elapsed = 0f;

            while (elapsed < duration)
            {
                elapsed += Time.deltaTime;
                canvasGroup.alpha = Mathf.Lerp(startAlpha, 0f, elapsed / duration);
                yield return null;
            }

            canvasGroup.alpha = 0f;
            if (deactivate)
            {
                canvasGroup.gameObject.SetActive(false);
            }
        }

        /// <summary>
        /// Scale pop effect (for modals, toasts).
        /// </summary>
        public static IEnumerator ScaleIn(Transform target, float duration = 0.2f)
        {
            target.localScale = Vector3.zero;
            target.gameObject.SetActive(true);

            float elapsed = 0f;
            while (elapsed < duration)
            {
                elapsed += Time.deltaTime;
                float t = EaseOutBack(elapsed / duration);
                target.localScale = Vector3.one * t;
                yield return null;
            }

            target.localScale = Vector3.one;
        }

        /// <summary>
        /// Scale out effect.
        /// </summary>
        public static IEnumerator ScaleOut(Transform target, float duration = 0.15f, bool deactivate = true)
        {
            float elapsed = 0f;
            while (elapsed < duration)
            {
                elapsed += Time.deltaTime;
                float t = 1f - (elapsed / duration);
                target.localScale = Vector3.one * t;
                yield return null;
            }

            target.localScale = Vector3.zero;
            if (deactivate)
            {
                target.gameObject.SetActive(false);
            }
        }

        /// <summary>
        /// Pulse animation (for hotspots, indicators).
        /// </summary>
        public static IEnumerator Pulse(Transform target, float scale = 1.1f, float duration = 0.5f, int loops = -1)
        {
            Vector3 originalScale = target.localScale;
            Vector3 targetScale = originalScale * scale;
            int loopCount = 0;

            while (loops < 0 || loopCount < loops)
            {
                // Scale up
                float elapsed = 0f;
                while (elapsed < duration / 2f)
                {
                    elapsed += Time.deltaTime;
                    float t = elapsed / (duration / 2f);
                    target.localScale = Vector3.Lerp(originalScale, targetScale, EaseInOutQuad(t));
                    yield return null;
                }

                // Scale down
                elapsed = 0f;
                while (elapsed < duration / 2f)
                {
                    elapsed += Time.deltaTime;
                    float t = elapsed / (duration / 2f);
                    target.localScale = Vector3.Lerp(targetScale, originalScale, EaseInOutQuad(t));
                    yield return null;
                }

                loopCount++;
            }

            target.localScale = originalScale;
        }

        private static IEnumerator AnimatePosition(RectTransform target, Vector2 start, Vector2 end, float duration, EaseType ease)
        {
            float elapsed = 0f;

            while (elapsed < duration)
            {
                elapsed += Time.deltaTime;
                float t = elapsed / duration;

                t = ApplyEasing(t, ease);
                target.anchoredPosition = Vector2.Lerp(start, end, t);
                yield return null;
            }

            target.anchoredPosition = end;
        }

        private static float ApplyEasing(float t, EaseType ease)
        {
            switch (ease)
            {
                case EaseType.EaseIn:
                    return t * t;
                case EaseType.EaseOut:
                    return 1f - (1f - t) * (1f - t);
                case EaseType.EaseInOut:
                    return EaseInOutQuad(t);
                default:
                    return t;
            }
        }

        private static float EaseInOutQuad(float t)
        {
            return t < 0.5f ? 2f * t * t : 1f - Mathf.Pow(-2f * t + 2f, 2f) / 2f;
        }

        private static float EaseOutBack(float t)
        {
            const float c1 = 1.70158f;
            const float c3 = c1 + 1f;
            return 1f + c3 * Mathf.Pow(t - 1f, 3f) + c1 * Mathf.Pow(t - 1f, 2f);
        }
    }
}
