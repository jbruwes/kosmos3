import {
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import {
  get,
  isDefined,
  set,
  useFetch,
  watchDebounced,
  whenever,
} from "@vueuse/core";
import { logicAnd, logicNot } from "@vueuse/math";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

export default defineStore("app", () => {
  /**
   * переключатель видимости правой панели
   * @type {boolean}
   */
  const rightDrawer = ref(null);
  /**
   * корзина в сервисе s3
   * @type {string}
   */
  const bucket = ref("");
  /**
   * путь к сайту через сервис s3
   * @type {string}
   */
  const wendpoint = ref("");
  /**
   * клиент к сервису s3
   * @type {object}
   */
  const s3 = ref();
  /**
   * индекс сайта
   * @type {object}
   */
  const index = ref();
  /**
   * считывание заголовка файла
   * @param {string} Key имя файла
   * @returns {object} заголовок файла
   */
  const headObject = async (Key) => {
    const Bucket = get(bucket);
    let head;
    if (isDefined(s3))
      head = await get(s3).send(new HeadObjectCommand({ Bucket, Key }));
    return head;
  };
  /**
   * Запись объекта
   * @param {string} Key имя файла
   * @param {string} ContentType тип mime
   * @param {string | Uint8Array | Buffer} body тело файла
   */
  const putObject = async (Key, ContentType, body) => {
    const Bucket = get(bucket);
    const Body =
      typeof body === "string" ? new TextEncoder().encode(body) : body;
    if (isDefined(s3))
      await get(s3).send(
        new PutObjectCommand({ Bucket, Key, ContentType, Body }),
      );
  };
  /**
   * Запись файла
   * @param {string} Key имя файла
   * @param {string} ContentType тип mime
   * @param {File} file файл
   */
  const putFile = async (Key, ContentType, file) => {
    await putObject(Key, ContentType, await file.arrayBuffer());
  };
  /**
   * Считывание объекта
   * @param {string} Key Имя файла
   * @returns {string} Тело файла
   */
  const getObject = async (Key) => {
    const Bucket = get(bucket);
    const ResponseCacheControl = "no-store";
    let ret;
    if (isDefined(s3)) {
      const { Body } = await get(s3).send(
        new GetObjectCommand({ ResponseCacheControl, Bucket, Key }),
      );
      ret = await new Promise((resolve) => {
        const reader = Body.getReader();
        const textDecoder = new TextDecoder();
        (async function read(chunks) {
          const { done, value } = await reader.read();
          if (done) resolve(chunks.join(""));
          else {
            chunks.push(textDecoder.decode(value));
            read(chunks);
          }
        })([]);
      });
    }
    return ret;
  };
  const requiredFiles = ["index.html", "favicon.ico"];
  const { data } = useFetch("monolit/manifest.json", {
    /**
     * Преводим в массив
     * @param { object } ctx - возвращаемый объект
     * @returns { object } - трансформируемый возвращаемый объект
     */
    afterFetch(ctx) {
      ctx.data = [
        ...requiredFiles,
        ...Object.values(ctx.data).map(({ file }) => file),
      ];
      return ctx;
    },
  }).json();
  const base = computed(
    () =>
      `${isDefined(wendpoint) ? get(wendpoint) : "htpps:/"}/${get(bucket)}/`,
  );
  /**
   * проверка структуры сайта
   * @param {object} index - структура сайта
   * @param {object} index.content - контент
   * @param {Array} index.css - ссылки на стили
   * @param {string} index.style - стили
   * @param {Array} index.js - ссылки на скрипты
   * @param {string} index.script - скрипт
   * @param {object} index.settings - настройки
   * @returns {object} - структура сайта
   */
  const calcIndex = ({
    content: pContent = [],
    css: pCss = [],
    style: pStyle = "",
    js: pJs = [],
    script: pScript = "",
    settings: pSettings = {},
  } = {}) => {
    let [content = {}] = pContent;
    let css = [...pCss].filter(Boolean);
    let style = pStyle;
    let js = [...pJs].filter(Boolean);
    let script = pScript;
    let settings = { ...pSettings };
    css = Array.isArray(css)
      ? css
          .map(({ id = crypto.randomUUID(), url = "" }) => ({ id, url }))
          .filter(({ url }) => url)
      : [];
    if (!css.length) css.push({ id: crypto.randomUUID(), url: "" });
    js = Array.isArray(js)
      ? js
          .map(({ id = crypto.randomUUID(), url = "" }) => ({ id, url }))
          .filter(({ url }) => url)
      : [];
    if (!js.length) js.push({ id: crypto.randomUUID(), url: "" });
    const {
      id = crypto.randomUUID(),
      visible = true,
      label = get(bucket),
      html = "",
    } = content;
    content = [{ ...content, id, visible, label, html }];
    style = String(style) === style ? style : "";
    script = String(script) === script ? script : "";
    const { yandex, metrika, google, analytics } = settings;
    settings = { yandex, metrika, google, analytics };
    return { content, css, style, js, script, settings };
  };
  whenever(s3, async () => {
    let json = {};
    try {
      json = JSON.parse((await getObject("data.json")) || "{}");
    } finally {
      set(index, calcIndex(json));
    }
  });
  const settings = computed({
    /**
     * чтение настроек
     * @returns {object} настройки
     */
    get: () => get(index)?.settings,
    /**
     * запись настроек
     * @param {object} value настройки
     */
    set(value) {
      if (isDefined(index)) get(index).settings = value;
    },
  });
  const script = computed({
    /**
     * чтение скрипта
     * @returns {string} скрипт
     */
    get: () => get(index)?.script,
    /**
     * запись скрипта
     * @param {string} value скрипт
     */
    set(value) {
      if (isDefined(index)) get(index).script = value;
    },
  });
  const style = computed({
    /**
     * чтение стилей
     * @returns {string} стили
     */
    get: () => get(index)?.style,
    /**
     * запись стилей
     * @param {string} value стили
     */
    set(value) {
      if (isDefined(index)) get(index).style = value;
    },
  });
  const js = computed({
    /**
     * чтение массива ссылок на скрипты
     * @returns {Array} массив ссылок на скрипты
     */
    get: () => get(index)?.js,
    /**
     * запись массива ссылок на скрипты
     * @param {Array} value массив ссылок на скрипты
     */
    set(value) {
      if (isDefined(index)) get(index).js = value.filter(({ url }) => url);
    },
  });
  const css = computed({
    /**
     * чтение массива ссылок на стили
     * @returns {Array} массив ссылок на стили
     */
    get: () => get(index)?.css,
    /**
     * запись массива ссылок на стили
     * @param {Array} value массив ссылок на стили
     */
    set(value) {
      if (isDefined(index)) get(index).css = value.filter(({ url }) => url);
    },
  });
  whenever(logicNot(s3), () => {
    set(index, undefined);
  });
  whenever(logicAnd(s3, data), () => {
    /**
     *
     * @param {string} pAsset - путь до файла ресурса
     */
    const headPutObject = async (pAsset) => {
      try {
        const head = await headObject(pAsset);
        if (requiredFiles.includes(pAsset)) throw new Error(head.ContentLength);
      } catch (e) {
        const byteLength = +e.message;
        const { data: body } = await useFetch(`monolit/${pAsset}`).blob();
        let lBody = null;
        if (Number.isNaN(byteLength)) lBody = get(body);
        else {
          const blob = new Blob(
            [(await get(body).text()).replace(/{{ domain }}/g, get(bucket))],
            { type: get(body).type },
          );
          if (byteLength !== (await blob.arrayBuffer()).byteLength)
            lBody = blob;
        }
        if (lBody) putObject(pAsset, lBody.type, lBody);
      }
    };
    get(data).forEach((asset) => {
      headPutObject(asset);
    });
  });
  watchDebounced(
    index,
    (value, oldValue) => {
      if (value && oldValue)
        putObject(
          "data.json",
          "application/json",
          JSON.stringify(calcIndex(value)),
        );
    },
    { deep: true, debounce: 1000, maxWait: 10000 },
  );
  return {
    ...{ bucket, wendpoint, base },
    ...{ index, js, script, css, style, settings },
    ...{ s3, putFile },
    ...{ rightDrawer },
  };
});
