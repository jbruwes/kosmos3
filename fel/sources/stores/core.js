import { defineStore } from "pinia";
import jsel from "jsel";

export default defineStore("core", {
  /**
   * @returns {object} Переменные состояния
   */
  state: () => ({
    tree: undefined,
    context: undefined,
  }),
  getters: {
    /**
     * Плоский индекс
     *
     * @returns {object[]} Плоский индекс для поиска
     */
    list() {
      return this.tree
        ? jsel(this.tree)
            .selectAll("//*[@id]")
            .map((node) => {
              const lNode = node;
              lNode.path = this.getVector(lNode).map((e) =>
                e.value.trim().replace(/\s/g, "_").replace(/\//g, "")
              );
              lNode.path.shift();
              lNode.path = lNode.path.join("/");
              lNode.path = lNode.path ? `/${lNode.path}/` : "/";
              lNode.href = lNode.url
                ? lNode.url
                    .trim()
                    .replace(/\s/g, "_")
                    .replace(/^\/+|\/+$/g, "")
                : "";
              lNode.href = lNode.href ? `/${lNode.href}/` : "";
              return lNode;
            })
        : undefined;
    },
    /**
     * Объекты одного уровня с текущим
     *
     * @returns {object[]} Массив объектов
     */
    siblings() {
      return this.item ? this.getSiblings(this.item) : undefined;
    },
    /**
     * Вычисление массива первого уровня
     *
     * @returns {object[]} Массив объектов первого уровня
     */
    children() {
      return this.item ? this.item.data : undefined;
    },
    /**
     * Вычисление массива первого уровня
     *
     * @returns {object[]} Массив объектов первого уровня
     */
    treeChildren() {
      return this.tree ? this.tree.data : undefined;
    },
    /**
     * Вычисление массива первого уровня
     *
     * @returns {object[]} Массив объектов первого уровня
     */
    parentChildren() {
      return this.parent ? this.parent.data : undefined;
    },
    /**
     * Вектор до текущего объекта
     *
     * @returns {object[]} Вектор
     */
    vector() {
      return this.item ? this.getVector(this.item) : undefined;
    },
    /**
     * Родительский объект
     *
     * @returns {object} Родитель
     */
    parent() {
      return this.item ? this.getParent(this.item) : undefined;
    },
    /**
     * Текущий объект
     *
     * @returns {object} Текущий объект для загрузки
     */
    item() {
      return this.list
        ? this.list.find((e) =>
            this.context
              ? e.path === this.context.routePath ||
                e.href === this.context.routePath
              : undefined
          )
        : undefined;
    },
    /**
     * Заголовок текущего объекта
     *
     * @returns {string} Заголовок
     */
    title() {
      return this.item ? this.getTitle(this.item) : "";
    },
    /**
     * Заголовок дерева
     *
     * @returns {string} Заголовок
     */
    treeTitle() {
      return this.tree ? this.getTitle(this.tree) : "";
    },
    /**
     * Заголовок родительского объекта
     *
     * @returns {string} Заголовок
     */
    parentTitle() {
      return this.parent ? this.getTitle(this.parent) : "";
    },
    /**
     * Описание текущего объекта
     *
     * @returns {string} Описание
     */
    description() {
      return this.item ? this.item.description : "";
    },
    /**
     * Описание дерева
     *
     * @returns {string} Описание
     */
    treeDescription() {
      return this.tree ? this.tree.description : "";
    },
    /**
     * Описание родительского объекта
     *
     * @returns {string} Описание
     */
    parentDescription() {
      return this.parent ? this.parent.description : "";
    },
    /**
     * Иконка текущего объекта
     *
     * @returns {string} Иконка
     */
    icon() {
      return this.item ? this.item.icon : "";
    },
    /**
     * Иконка дерева
     *
     * @returns {string} Иконка
     */
    treeIcon() {
      return this.tree ? this.tree.icon : "";
    },
    /**
     * Иконка родительского объекта
     *
     * @returns {string} Иконка
     */
    parentIcon() {
      return this.parent ? this.parent.icon : "";
    },
    /**
     * Путь текущего объекта
     *
     * @returns {string} Путь
     */
    path() {
      return this.item ? this.getPath(this.item) : "";
    },
    /**
     * Путь дерева
     *
     * @returns {string} Путь
     */
    treePath() {
      return this.tree ? this.getPath(this.tree) : "";
    },
    /**
     * Путь родительского объекта
     *
     * @returns {string} Путь
     */
    parentPath() {
      return this.parent ? this.getPath(this.parent) : "";
    },

    /**
     * Картинка текущего объекта
     *
     * @returns {string} Картинка
     */
    image() {
      return this.item ? this.item.image : "";
    },
    /**
     * Картинка дерева
     *
     * @returns {string} Картинка
     */
    treeImage() {
      return this.tree ? this.item.tree : "";
    },
    /**
     * Картинка родительского объекта
     *
     * @returns {string} Картинка
     */
    parentImage() {
      return this.parent ? this.parent.image : "";
    },
    /**
     * Вычисление текущего пути
     *
     * @returns {string} Путь
     */
    routePath() {
      return this.context ? this.context.routePath : "";
    },
  },
  actions: {
    /**
     * Загрузка данных в tree
     */
    async initIndex() {
      [this.tree] = await (
        await fetch("index.json", { cache: "no-store" })
      ).json();
    },
    /**
     * Вычисленние пути
     *
     * @param {object} item Объект вычисления
     * @returns {string} Путь
     */
    getPath: (item) => (item.href ? item.href : item.path),
    /**
     * Вычисление заголовка
     *
     * @param {object} item Объект вычисления
     * @returns {string} Заголовок
     */
    getTitle: (item) => (item.title ? item.title : item.value),
    /**
     * Вычисление вектора
     *
     * @param {object} item Объект вычисления
     * @returns {object[]} Вектор
     */
    getVector(item) {
      return jsel(this.tree).selectAll(
        `//*[@id="${item.id}"]/ancestor-or-self::*[@id]`
      );
    },
    /**
     * Вычисление родителя
     *
     * @param {object} item Объект вычисления
     * @returns {object} Родитель
     */
    getParent(item) {
      return jsel(this.tree).select(`//*[@id="${item.id}"]/../parent::*[@id]`);
    },
    /**
     * Вычисление объектов одного уровня
     *
     * @param {object} item Объект вычисления
     * @returns {object[]} Объекты одного уровня
     */
    getSiblings(item) {
      return jsel(this.tree).selectAll(
        `//*[@id="${item.id}"]/preceding-sibling::*[@id]|//*[@id="${item.id}"]|//*[@id="${item.id}"]/following-sibling::*[@id]`
      );
    },
    /**
     * Получение массива дочерних объектов
     *
     * @param {(number | boolean)} deep Флаг использования рекурсии
     *  по дочерним объектам
     * @param {number} length Количество дочерних объектов для изъятия
     * @param {(number | boolean)} reveal Флаг указывающий показывать ли
     *  скрытые объекты
     * @param {string} sort Флаг указывающий на необходимость
     *  отсортировать результат
     * @param {string} path CSV путей до дочерних объектов
     * @param {(number | boolean)} children Выбирать папки или файлы?
     * Если путое значение то всё
     * @param {string} [attr=""] Путь xpath
     * @param {string} axe Заведует включением параметра xpath axe
     * @returns {object[]} Массив дочерних объектов
     */
    getItems(deep, length, reveal, sort, path, children, attr, axe) {
      console.log(path);
      const hash = this.routePath.replace(/^\/+|\/+$/g, "");
      let lChildren = null;
      let lAttr = attr ? attr : "";
      let dataHashes = path ? path.trim() : "";
      let dataChildren = [];
      if (!dataHashes) dataHashes = hash;
      dataHashes = dataHashes.split(",").map((value) =>
        decodeURIComponent(value.trim())
          .replace(/_/g, " ")
          .replace(/\/+/g, "/")
          .replace(/^\/+|\/+$/g, "")
      );
      dataHashes.forEach((dataHash) => {
        try {
          if (
            typeof children === "undefined" ||
            children === null ||
            children === ""
          )
            lChildren = "";
          else lChildren = children ? "[*]" : "[not(*)]";
          $.merge(
            dataChildren,
            jsel(this.tree).selectAll(
              `/*${
                dataHash
                  ? `/data/*[@value="${dataHash
                      .split("/")
                      .join('"]/data/*[@value="')}"]`
                  : ""
              }${lAttr && !axe ? "/data" : ""}${
                deep && lAttr && !axe ? "/" : ""
              }${lAttr ? "/" : ""}${axe ? `${axe}::` : ""}${lAttr}${
                lAttr && !axe && !reveal ? "[@visible=1]" : ""
              }${lChildren}`
            )
          );
        } catch (e) {
          // console.log(e.message);
        }
      });
      if (lAttr && !axe) {
        dataChildren = dataChildren.filter(
          (element) => element.$href.replace(/^\/+|\/+$/g, "") !== hash
        );
      }
      if (
        length &&
        !Number.isNaN(Number(length)) &&
        length > 0 &&
        length < dataChildren.length
      ) {
        dataChildren = dataChildren.slice(0, length);
      }
      switch (sort) {
        case "random":
          dataChildren.sort(() => 0.5 - Math.random());
          break;
        case "date":
          dataChildren.sort((a, b) => {
            if (a.date > b.date) return -1;
            if (a.date < b.date) return 1;
            return 0;
          });
          break;
        default:
      }
      return dataChildren;
    },
  },
});
