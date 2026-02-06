using System.Collections;
using UnityEngine;

namespace DetectiveGame.UI
{
    /// <summary>
    /// Base class for all panels (Scene, Clues, Suspects, Deduction, Notebook).
    /// </summary>
    public abstract class BasePanel : MonoBehaviour
    {
        [Header("Panel Settings")]
        [SerializeField] protected RectTransform rectTransform;
        [SerializeField] protected CanvasGroup canvasGroup;
        [SerializeField] protected float animationDuration = 0.3f;

        protected bool _isVisible = false;

        protected virtual void Awake()
        {
            if (rectTransform == null)
                rectTransform = GetComponent<RectTransform>();
            if (canvasGroup == null)
                canvasGroup = GetComponent<CanvasGroup>();
        }

        /// <summary>
        /// Show the panel with animation.
        /// </summary>
        public virtual IEnumerator Show()
        {
            _isVisible = true;
            yield return UIAnimations.SlideInFromBottom(rectTransform, animationDuration);
            OnShown();
        }

        /// <summary>
        /// Hide the panel with animation.
        /// </summary>
        public virtual IEnumerator Hide()
        {
            _isVisible = false;
            yield return UIAnimations.SlideOutToBottom(rectTransform, animationDuration * 0.8f);
            OnHidden();
        }

        /// <summary>
        /// Called after panel is fully shown.
        /// </summary>
        protected virtual void OnShown() { }

        /// <summary>
        /// Called after panel is fully hidden.
        /// </summary>
        protected virtual void OnHidden() { }

        /// <summary>
        /// Refresh the panel content.
        /// </summary>
        public abstract void Refresh();

        public bool IsVisible => _isVisible;
    }

    /// <summary>
    /// Base class for all modals (ClueDetail, SuspectDetail, Result).
    /// </summary>
    public abstract class BaseModal : MonoBehaviour
    {
        [Header("Modal Settings")]
        [SerializeField] protected RectTransform modalContainer;
        [SerializeField] protected CanvasGroup backdrop;
        [SerializeField] protected float animationDuration = 0.2f;

        protected bool _isVisible = false;

        protected virtual void Awake()
        {
            if (modalContainer == null)
                modalContainer = transform.Find("Container")?.GetComponent<RectTransform>();
            if (backdrop == null)
                backdrop = GetComponent<CanvasGroup>();
        }

        /// <summary>
        /// Set data before showing the modal.
        /// </summary>
        public abstract void SetData(object data);

        /// <summary>
        /// Show the modal with animation.
        /// </summary>
        public virtual IEnumerator Show()
        {
            _isVisible = true;
            gameObject.SetActive(true);

            // Fade in backdrop and scale in container
            if (backdrop != null)
            {
                backdrop.alpha = 0f;
                StartCoroutine(UIAnimations.FadeIn(backdrop, animationDuration));
            }

            if (modalContainer != null)
            {
                yield return UIAnimations.ScaleIn(modalContainer, animationDuration);
            }

            OnShown();
        }

        /// <summary>
        /// Hide the modal with animation.
        /// </summary>
        public virtual IEnumerator Hide()
        {
            _isVisible = false;

            if (modalContainer != null)
            {
                yield return UIAnimations.ScaleOut(modalContainer, animationDuration * 0.75f, false);
            }

            if (backdrop != null)
            {
                yield return UIAnimations.FadeOut(backdrop, animationDuration * 0.5f, true);
            }
            else
            {
                gameObject.SetActive(false);
            }

            OnHidden();
        }

        /// <summary>
        /// Called after modal is fully shown.
        /// </summary>
        protected virtual void OnShown() { }

        /// <summary>
        /// Called after modal is fully hidden.
        /// </summary>
        protected virtual void OnHidden() { }

        /// <summary>
        /// Close the modal (can be called from UI button).
        /// </summary>
        public void Close()
        {
            UIManager.Instance?.CloseTopModal();
        }

        public bool IsVisible => _isVisible;
    }
}
