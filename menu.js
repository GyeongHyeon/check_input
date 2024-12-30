class ArrowableList extends HTMLElement {
  static #IsThisRegisteredCustomElement=false
  static registerToCustomElement (  ) {
    if (!this.#IsThisRegisteredCustomElement) {
      this.#IsThisRegisteredCustomElement = true;
      customElements.define('arrow-nav',ArrowableList);
    }
  }
  #tabKeyAccessControl = -1;
  #focused = 0;
  #isAccessibleElement(e) {
    const style = getComputedStyle(e);
    return !e.hasAttribute("hidden") && !e.hasAttribute("inert") && this.getAttribute("aria-hidden") != "true"
        && style.display != "none" && style.visibility != "hidden" && style.contentVisibility != "hidden"
  }

  constructor() {
    super();
    this.attachShadow({mode:"open"});
    const template = document.createElement('template');
    template.innerHTML = `
      <style>
        :host { display:block; min-height:fit-content; max-height:max-content; height:auto; width:100%; }
        
      </style>
      <div role="application">
        <div role="list">
          <slot id="nav-item" name="nav-item"></slot>
        </div>
      </div>`;
    this.shadowRoot.append(template.content.cloneNode(true));

    const reprocessItems = ()=> {
      const nodes = this.childNodes;
      nodes.forEach(node =>{
        if ( node instanceof HTMLAnchorElement || node instanceof HTMLButtonElement ) {
          const item = document.createElement("div");
          node.tabIndex = "-1";
          const itemClass = this.getAttribute("item-class")?.split(" ");
          if(itemClass){
            item.classList.add(...itemClass)
          }
          item.setAttribute("role","listitem")
          item.setAttribute("slot","nav-item")
          item.append(node.cloneNode(true)) // item으로 위치 이동
          node.replaceWith(item); // node를 row로 대체
        }
      })
    }
    reprocessItems()
    const observer = new MutationObserver((records)=>{
      reprocessItems();
    });
    observer.observe(this,{childList:true})
  }

  set focused(index) {
    this.#focused = index >= this.itemCount-1 ? this.itemCount-1 : (index <= 0 ? 0 : index);
    this.#items.forEach((item,rowIndex)=>{
      
      item.classList.toggle("focused",rowIndex == this.#focused);
      const focusable = item.querySelector('button,a');
      if (focusable){
        focusable.tabIndex = this.#focused == rowIndex ? 0 : -1;
      }
    });
  }
  get focused(){ return this.#items.findIndex(e=>e.classList.contains("focused")); }
  get itemCount(){ return this.#items.length; }
  
  setFocusToFocusedItem(){ 
    const item = this.#items[this.focused];
    const focusable = item.querySelector('button,a');
    if (focusable){
      focusable.focus();
    }
  }
  get #items() {
    return [...this.querySelectorAll("[role=listitem]")].filter(e=>{
      
      if (this.#isAccessibleElement(e)) {
        return e;
      }
    });
  }

  connectedCallback(){
    this.focused = 0;
    this.#items.forEach((item,index)=>{
      item.addEventListener("focusin",(e)=>{
        this.setFocusToFocusedItem();
      })
      item.addEventListener('keydown',(e)=>{
        switch(e.code) {
          case "Enter":
          case "Space":
            e.preventDefault();
            this.querySelector("a,button")?.click();
            break;
          case "ArrowLeft":
          case "ArrowUp":
            e.preventDefault();
            this.focused = this.focused-1;
            this.setFocusToFocusedItem();
            break;
          case "ArrowRight":
          case "ArrowDown":
            e.preventDefault();
            this.focused = this.focused+1;
            this.setFocusToFocusedItem();
            break;
          case "Tab":
            
            clearTimeout(this.#tabKeyAccessControl);
            this.#tabKeyAccessControl = setTimeout(()=>{
              if( !e.shiftKey ){
                  this.focused = this.itemCount-1;
              } else {
                  this.focused = 0;
              }
            },50)
            break;
        }
      });
    })

  }
}

ArrowableList.registerToCustomElement() 