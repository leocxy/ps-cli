/* eslint-disable */

/*******************************************************************************
 * Development script
 *
 * This script is only included on the page when Browsersync is being used. It's
 * a great place to put any customizations that you only want to occur while
 * developing your theme.
 ******************************************************************************/

/**
 * Persistent preview bar minimization
 *
 * Adds a token to sessionStorage when the 'minimize' button is clicked on the
 * preview bar that appears when previewing an unpublished theme. This token is
 * checked for on subsequent page loads, and if found, the preview is hidden.
 */
(function () {
  const hidePreviewBar = () => {
    let iframe = document.querySelector('iframe#preview-bar-iframe');
    if (!iframe) return false;
    iframe.style.display = 'none';
    return true;
  };
  window.addEventListener('DOMContentLoaded', () => {
    let clock = setInterval(() => {
      let rs = hidePreviewBar();
      if (rs) clearInterval(clock);
    }, 1000);
  });
})();
/* eslint-enable */