!(() => {
  // one <toast-message> element is enough for the whole document

  // ==========================================================================
  const createElement = (tag, props = {}) =>
    Object.assign(document.createElement(tag), props);

  // ==========================================================================
  // injects the toast-message element into the document!!
  setTimeout(() => {
    document.body.appendChild(createElement("toast-message"));
    //.show("Hello, App!", { delay: 200 });
  }, 1000); // inject at end of DOM

  // ==========================================================================
  // global handle for ease of use
  window.showToastMessage = (message, options) =>
    document.querySelector("toast-message").show(message, options);

  // ==========================================================================
  customElements.define(
    "toast-message",
    class extends HTMLElement {
      // ----------------------------------------------------------------------
      constructor() {
        super()
          .attachShadow({ mode: "open" })
          .append(
            createElement("style", {
              textContent:
                `main{` +
                `z-index:999;position:fixed;bottom:6px;right:6px;display:flex;flex-direction:column;gap:6px` +
                `}` +
                `.toast{` +
                `background:var(--toast-message-background,#333);color:var(--toast-message-color,white);` +
                `box-shadow:0 6px 6px rgba(0, 0, 0, .5);` +
                `padding:6px 12px;border-radius:4px;opacity:0;` +
                `transform:translateY(50%);transition:transform 0.25s, opacity 0.25s` +
                `}` +
                `.toast.show{opacity:1;transform:translateY(0)}`,
            }),
            (this.main = createElement("main", {
              part: "main",
            }))
          );
      }
      // ----------------------------------------------------------------------
      connectedCallback() {
        this.listen(
          this.localName, // event name
          (evt) =>
            this.show(
              evt.detail.message,
              evt.detail.options || {}, // function
              console.log("toast-message event received!")
            )
        );
      }
      // ----------------------------------------------------------------------
      listen(type, listener, scope = document) {
        scope.addEventListener(type, listener);
        let remove = () => scope.removeEventListener(type, listener);
        this.listeners = this.listeners || [];
        this.listeners.push(remove);
        return remove;
      }
      // ----------------------------------------------------------------------
      disconnectedCallback() {
        this.listeners?.forEach((remove) => remove());
      }
      // ----------------------------------------------------------------------
      show(textContent, { delay = this.getAttribute("delay") || 5000 } = {}) {
        console.log(textContent, delay);
        const toast = createElement("div", {
          part: "toast",
          className: "toast",
          textContent,
        });
        this.main.append(toast);
        requestAnimationFrame(() => toast.classList.add("show")); // Trigger fade-in animation
        setTimeout(() => {
          toast.classList.remove("show");
          toast.addEventListener("transitionend", () => toast.remove(), {
            once: true,
          });
        }, delay);
      }
      // ----------------------------------------------------------------------
    } // class
  ); // customElements.define
})(); // IIFE
