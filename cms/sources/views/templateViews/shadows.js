import { JetView } from "webix-jet";
import * as webix from "webix/webix.min";

/**
 * Класс теней
 */
export default class ShadowView extends JetView {
  /**
   * Конструктор
   *
   * @param {object} app Объект приложения
   */
  constructor(app) {
    super(app);
    webix.editors.number = webix.extend(
      {
        /**
         * Отрисовщик поля типа number
         *
         * @returns {object} Объект поля типа number
         */
        render: () =>
          webix.html.create(
            "div",
            {
              class: "webix_dt_editor",
            },
            "<input type='number'>"
          ),
      },
      webix.editors.text
    );
  }

  /**
   * Конфигурация
   *
   * @returns {object} Объект конфигурации
   */
  config = () => ({
    id: "shadows",
    view: "datatable",
    select: "row",
    columns: [
      {
        id: "x",
        editor: "number",
        header: "<span class='mdi mdi-pan-horizontal'></span> offset x",
        fillspace: true,
      },
      {
        id: "y",
        editor: "number",
        header: "<span class='mdi mdi-pan-vertical'></span> offset y",
        fillspace: true,
      },
      {
        id: "blur",
        editor: "number",
        header: "<span class='mdi mdi-blur'></span> blur radius",
        fillspace: true,
      },
      {
        id: "spread",
        editor: "number",
        header: "<span class='mdi mdi-vector-combine'></span> spread radius",
        fillspace: true,
      },
      {
        id: "inset",
        editor: "checkbox",
        header: "<span class='mdi mdi-square-inc'></span> inset",
        template: "{common.checkbox()}",
        fillspace: true,
      },
      {
        id: "color",
        editor: "color",
        header: "<span class='mdi mdi-palette'></span> color",
        fillspace: true,
        template:
          "<span style='background:#color#; border-radius:4px;padding-right:10px;'>&nbsp;&nbsp;</span> #color#",
      },
    ],
    editable: true,
    on: {
      /**
       * Обработчик перерисовки на обновление
       */
      "data->onStoreUpdated": () => {
        this.getParentView().redraw.call(this.getParentView());
      },
    },
  });
}
