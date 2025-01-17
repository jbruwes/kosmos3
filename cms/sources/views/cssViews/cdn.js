import { JetView } from "webix-jet";
import * as webix from "webix/webix.min";

/**
 * Класс представления списка стилей для загрузки
 */
export default class CdnView extends JetView {
  #config;

  #event = [];

  /**
   * Деструктор
   */
  destroy() {
    if (this.#event)
      this.#event.forEach((event) => event.component.detachEvent(event.id));
    this.#config = null;
    this.#event = null;
  }

  /**
   * Коструктор
   *
   * @param {object} app Объект приложения
   */
  constructor(app) {
    super(app);
    this.#config = {
      id: "cdn",
      view: "datatable",
      select: "row",
      columns: [
        {
          id: "url",
          editor: "text",
          header: "CSS path",
          fillspace: true,
        },
      ],
      editable: true,
    };
  }

  /**
   * Конфигурация
   *
   * @returns {object} Объект конфигурации
   */
  config = () => this.#config;

  /**
   * Обработчик готовности представления класса
   */
  async ready() {
    try {
      $$("cdn").clearAll();
      const result = await this.app.io.getObject("index.cdn.css");
      if (this.app) {
        const url = result ? result.split("\n") : [];
        Object.keys(url).forEach((x) => {
          $$("cdn").add({
            url: url[x].replace(/^@import url\(/, "").replace(/\);$/, ""),
          });
        });
        if (url.length) $$("cdn").select($$("cdn").getFirstId());
        this.#event.push({
          component: $$("cdn").data,
          id: $$("cdn").data.attachEvent("onStoreUpdated", async () => {
            try {
              const lUrl = [];
              $$("cdn")
                .serialize()
                .forEach((value) => lUrl.push(`@import url(${value.url});`));
              await this.app.io.putObject(
                "index.cdn.css",
                "text/css",
                lUrl.join("\n")
              );
              if (this.app) webix.message("CSS cdn list save complete");
            } catch (err) {
              if (this.app)
                webix.message({
                  text: err.message,
                  type: "error",
                });
            }
          }),
        });
      }
    } catch (err) {
      if (this.app)
        webix.message({
          text: err.message,
          type: "error",
        });
    }
  }
}
