import { JetView } from "webix-jet";

/**
 * Класс тулбара для классов
 */
export default class ClassToolbarView extends JetView {
  #config;

  /**
   * Деструктор
   */
  destroy() {
    this.#config = null;
  }

  /**
   * Конструктор
   *
   * @param {object} app Объект приложения
   */
  constructor(app) {
    super(app);
    this.#config = {
      view: "toolbar",
      cols: [
        {
          view: "icon",
          icon: "mdi mdi-file-document-outline",
          /**
           * Новый класс
           */
          click: () => {
            $$("class").select(
              $$("class").add({
                class: "",
              })
            );
          },
        },
        {
          view: "icon",
          icon: "mdi mdi-delete-outline",
          /**
           * Удаление класса
           */
          click: () => {
            const id = $$("class").getSelectedId();
            if (id) {
              $$("class").editCancel();
              let newId = $$("class").getPrevId(id);
              if (!newId) newId = $$("class").getNextId(id);
              $$("class").remove(id);
              if (newId) $$("class").select(newId);
            }
          },
        },
        {},
      ],
    };
  }

  /**
   * Конфигурация
   *
   * @returns {object} Объект конфигурации
   */
  config = () => this.#config;
}
