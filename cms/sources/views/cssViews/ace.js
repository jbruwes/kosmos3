import { JetView } from "webix-jet";
import * as webix from "webix/webix.min";
import "../../ace";

/**
 *
 */
export default class AceView extends JetView {
  #config;

  #editor;

  #session;

  /**
   *
   */
  destroy() {
    if (this.#session) this.#session.removeAllListeners("change");
    this.#config = null;
    this.#editor = null;
    this.#session = null;
  }

  /**
   * @param app
   */
  constructor(app) {
    super(app);
    this.#config = {
      view: "ace-editor",
      theme: "tomorrow",
      mode: "css",
    };
  }

  /**
   *
   */
  config = () => this.#config;

  /**
   *
   */
  init() {
    this.main();
  }

  /**
   * @param text
   */
  async cb(text) {
    const timeoutId = [];
    this.#editor = await this.getRoot().getEditor(true);
    if (this.app) {
      this.#session = this.#editor.getSession();
      this.#session.setUseWrapMode(true);
      this.#session.setValue(text, -1);
      this.#session.on("change", () => {
        timeoutId.push(
          webix.delay(
            async () => {
              timeoutId.pop();
              if (!timeoutId.length) {
                try {
                  await this.app.io.putObject(
                    "index.css",
                    "text/css",
                    this.#editor.getValue()
                  );
                  if (this.app) webix.message("CSS save complete");
                } catch (err) {
                  if (this.app)
                    webix.message({
                      text: err.message,
                      type: "error",
                    });
                }
              }
            },
            this,
            [],
            1000
          )
        );
      });
      this.#editor.resize();
    }
  }

  /**
   *
   */
  async main() {
    try {
      const indexCss = await this.app.io.getObject("index.css");
      if (this.app) this.cb(indexCss);
    } catch (err) {
      if (this.app) this.cb("");
    }
  }
}
