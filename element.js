!(() => {
  // one <toast-message> element is enough for the whole document

  // ========================================================================== Helper function
  const createElement = (tag, props = {}) =>
    Object.assign(document.createElement(tag), props);

  // ========================================================================== append <toast-message> element to the document
  // injects the toast-message element into the document!!
  setTimeout(() => {
    document.body.appendChild(createElement("toast-message"));
    //.show("Hello, App!", { delay: 200 });
  }, 1000); // inject at end of DOM

  // ========================================================================== global function
  // global handle for ease of use
  window.showToastMessage = (message, delay) =>
    document.querySelector("toast-message").show(message, delay);

  // ========================================================================== define <toast-message> element
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
                // main container position and style
                `:host{` + // :host so user can style <toast-message>
                `display:flex;flex-direction:column;gap:6px;` +
                `z-index:1000;position:fixed;bottom:6px;right:6px` +
                `}` +
                // toast messages style, can also be styled with ::part(toast)
                `div{` +
                `background:var(--toast-message-background,#333);color:var(--toast-message-color,white);` +
                `box-shadow:0 6px 6px rgba(0, 0, 0, .5);` +
                `padding:6px 12px;border-radius:4px;` +
                `opacity:0;` +
                `transform:translateY(50%);transition:transform 0.25s, opacity 0.25s` +
                `}` +
                `.show{` +
                `opacity:1;transform:translateY(0)` +
                `}`,
            })
          );
      }
      // ----------------------------------------------------------------------
      connectedCallback() {
        this.id = this.id || "toast";
        this.listen({
          type: this.localName, // event name
          func: (evt) => this.show(evt.detail.message, evt.detail.delay),
        });
      }
      // ---------------------------------------------------------------------- listeners
      listen({ type, func, scope = document, options = {} }) {
        scope.addEventListener(type, func);
        let remove = () => scope.removeEventListener(type, func, options);
        this.listeners = this.listeners || [];
        this.listeners.push(remove);
        return remove;
      }
      // ---------------------------------------------------------------------- remove listeners
      disconnectedCallback() {
        this.listeners?.forEach((remove) => remove());
      }
      // ----------------------------------------------------------------------
      #listeners = [];
      show(
        textContent,
        delay = this.getAttribute("delay") || 5000,
        //
        toast = createElement("div", {
          part: "toast", // make it stylable with ::part(toast)
          textContent,
        })
      ) {
        if (delay < 0) {
          this.shadowRoot
            .querySelectorAll("div")
            .forEach((toast) => toast.remove());
          this.#listeners.forEach((remove) => remove());
          return;
        }
        this.shadowRoot.append(toast);
        toast.classList.add("show"); // Trigger fade-in animation
        setTimeout(() => {
          this.#listeners.push(
            this.listen({
              // wait for animation to end
              scope: toast,
              type: "transitionend",
              func: () => {
                toast.remove();
              },
              options: {
                once: true,
              },
            })
          );
          toast.classList.remove("show"); // Trigger fade-out animation
        }, delay);
      }
      // ----------------------------------------------------------------------
    } // class
  ); // customElements.define
})(); // IIFE
