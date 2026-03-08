// Neuroscience-based Pattern Interrupt: "Intention Gate"
// Forces Task Positive Network (TPN) activation and suppresses Default Mode Network (DMN)

// Check if we've already shown the gate in this session
const STORAGE_KEY = "intention_gate_shown";
const hasShownGate = sessionStorage.getItem(STORAGE_KEY);

// Only show if not already shown (prevents multiple triggers)
if (!hasShownGate) {
  sessionStorage.setItem(STORAGE_KEY, "true");
  showIntentionGate();
}

function showIntentionGate() {
  // 1. Create the full-screen high-salience overlay
  const overlay = document.createElement("div");
  overlay.id = "intention-gate-overlay";

  // Force styles inline to prevent conflicts
  overlay.setAttribute(
    "style",
    `
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    height: 100% !important;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%) !important;
    z-index: 2147483647 !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    opacity: 0 !important;
    transition: opacity 0.4s ease !important;
  `,
  );

  // 2. Create the modal container
  const modal = document.createElement("div");
  modal.id = "intention-gate-modal";

  // 3. Build the intention declaration interface
  modal.innerHTML = `
    <div class="pulse-circle"></div>
    <h1>Before you continue...</h1>
    <p class="subtitle">What is your specific goal right now?</p>
    
    <div class="input-container">
      <input 
        type="text" 
        id="intention-input" 
        placeholder="Type your specific intention..."
        autocomplete="off"
        spellcheck="false"
      />
      <div class="char-counter">
        <span id="char-count">0</span> / 4 minimum
      </div>
    </div>
    
    <div class="button-container">
      <button id="btn-cancel" class="btn btn-cancel">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2 2L14 14M2 14L14 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        Not sure, go back
      </button>
      <button id="btn-continue" class="btn btn-continue" disabled>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2 8L6 12L14 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Continue with intention
      </button>
    </div>
    
    <p class="help-text">This helps you stay focused on what matters.</p>
  `;

  // 4. Assemble the overlay
  overlay.appendChild(modal);

  // 5. Protect the overlay from being removed by the page
  const protectOverlay = () => {
    const existingOverlay = document.getElementById("intention-gate-overlay");
    if (
      !existingOverlay &&
      document.body &&
      !sessionStorage.getItem("intention_gate_completed")
    ) {
      document.body.appendChild(overlay);
      // Fade in after append
      requestAnimationFrame(() => {
        overlay.style.opacity = "1";
      });
    }
  };

  // 6. Create a MutationObserver to re-add overlay if removed
  let observer;
  const startProtection = () => {
    observer = new MutationObserver(() => {
      protectOverlay();
    });

    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: false,
      });
    }
  };

  // 7. Safely append to document
  function appendOverlay() {
    if (document.body) {
      document.body.appendChild(overlay);

      // Fade in the overlay
      requestAnimationFrame(() => {
        overlay.style.opacity = "1";
      });

      // Start protection against removal
      startProtection();

      setupInteractions();

      // Auto-focus the input after animation
      setTimeout(() => {
        const input = document.getElementById("intention-input");
        if (input) input.focus();
      }, 500);
    } else {
      // If body doesn't exist, wait for it
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", appendOverlay);
      } else {
        setTimeout(appendOverlay, 100);
      }
    }
  }

  // 6. Setup all interactions and validation logic
  function setupInteractions() {
    const input = document.getElementById("intention-input");
    const btnContinue = document.getElementById("btn-continue");
    const btnCancel = document.getElementById("btn-cancel");
    const charCount = document.getElementById("char-count");

    // Character counter and button state
    if (input && btnContinue && charCount) {
      input.addEventListener("input", () => {
        const length = input.value.trim().length;
        charCount.textContent = length;

        // Enable button only when user has typed at least 4 characters
        // This forces PFC engagement through language generation
        if (length >= 4) {
          btnContinue.disabled = false;
          btnContinue.classList.add("enabled");
        } else {
          btnContinue.disabled = true;
          btnContinue.classList.remove("enabled");
        }
      });

      // Allow Enter key to submit when valid
      input.addEventListener("keypress", (e) => {
        if (e.key === "Enter" && input.value.trim().length >= 4) {
          handleContinue();
        }
      });
    }

    // Cancel button: Go back in history
    if (btnCancel) {
      btnCancel.addEventListener("click", () => {
        // Mark as completed so it doesn't keep showing
        sessionStorage.setItem("intention_gate_completed", "true");

        // Stop the observer
        if (observer) {
          observer.disconnect();
        }

        // Go back
        window.history.back();
      });
    }

    // Continue button: Store intention and show persistent reminder
    if (btnContinue) {
      btnContinue.addEventListener("click", handleContinue);
    }

    function handleContinue() {
      const intention = input.value.trim();

      // Mark as completed so overlay won't reappear
      sessionStorage.setItem("intention_gate_completed", "true");

      // Stop the mutation observer
      if (observer) {
        observer.disconnect();
      }

      // Fade out and remove the modal overlay
      overlay.style.opacity = "0";
      setTimeout(() => {
        overlay.remove();
      }, 400);

      // Create persistent intention banner (Goal Maintenance)
      createIntentionBanner(intention);

      // Update page title to include intention
      updatePageTitle(intention);

      // Store intention in session storage for potential future use
      sessionStorage.setItem("currentIntention", intention);
      sessionStorage.setItem("intentionTimestamp", Date.now().toString());
    }
  }

  // 7. Create persistent intention banner (supports Proactive Control)
  function createIntentionBanner(intention) {
    const banner = document.createElement("div");
    banner.id = "intention-banner";
    banner.innerHTML = `
      <div class="banner-content">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"/>
          <path d="M8 5V8L10 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <span class="banner-text">Your intention: <strong>${escapeHtml(intention)}</strong></span>
        <button id="banner-dismiss" class="banner-close">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 2L12 12M2 12L12 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    `;

    if (document.body) {
      document.body.appendChild(banner);
      

      // Setup dismiss functionality
      const dismissBtn = document.getElementById("banner-dismiss");
      if (dismissBtn) {
        dismissBtn.addEventListener("click", () => {
          banner.style.animation = "slideOut 0.3s ease-out forwards";
          setTimeout(() => banner.remove(), 300);
        });
      }

      // Auto-animate in
      setTimeout(() => {
        banner.classList.add("visible");
      }, 100);
    }
  }

  // 8. Update page title to include intention
  function updatePageTitle(intention) {
    const originalTitle = document.title;
    document.title = `[${intention}] ${originalTitle}`;
  }

  // 9. Helper function to escape HTML
  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // Run the overlay logic
  appendOverlay();
}
