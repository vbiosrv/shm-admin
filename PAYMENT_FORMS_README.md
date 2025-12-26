# Универсальная система платежных форм

## Описание

Система позволяет динамически загружать HTML формы для настройки платежных систем из S3 бакета или локальных файлов.

## Как это работает

1. **API возвращает список платежных систем** с полями:
   - `name` - уникальное имя системы
   - `title` - отображаемое название
   - `descr` - описание
   - `url_form` - путь к HTML файлу с формой
   - `url_file` - путь к обработчику (для будущего использования)
   - `price` - стоимость подключения (опционально)

2. **При клике на платежную систему**:
   - Открывается универсальное модальное окно `UniversalPaymentModal`
   - Загружается HTML форма из S3 или локальной папки по пути `url_form`
   - Форма отображается в модальном окне

3. **При отправке формы**:
   - Данные собираются из всех полей формы
   - Отправляются POST запросом на `/shm/v1/admin/cloud/proxy/service/paysystem/configure`
   - В теле запроса: `{ "system": "название_системы", ...поля_формы }`

## Структура HTML форм

HTML формы должны следовать следующей структуре:

```html
<style>
  /* Стили с использованием CSS переменных темы */
  .form-input {
    background-color: var(--theme-input-bg);
    color: var(--theme-content-text);
    border: 1px solid var(--theme-input-border);
  }
</style>

<form class="payment-form">
  <div class="form-group">
    <label class="form-label" for="field_name">Название поля</label>
    <input 
      type="text" 
      id="field_name" 
      name="field_name" 
      class="form-input" 
      required
    />
  </div>
  
  <div class="form-actions">
    <button type="submit" class="btn btn-primary">
      Сохранить
    </button>
    <button type="button" class="btn btn-secondary" onclick="window.parent.postMessage('close', '*')">
      Отмена
    </button>
  </div>
</form>
```

## Доступные CSS переменные темы

- `--theme-card-bg` - фон карточек
- `--theme-card-border` - граница карточек
- `--theme-content-text` - основной цвет текста
- `--theme-content-text-muted` - приглушенный текст
- `--theme-input-bg` - фон полей ввода
- `--theme-input-border` - граница полей ввода
- `--accent-primary` - основной акцентный цвет
- `--accent-text` - цвет текста на акцентном фоне
- `--theme-button-secondary-bg` - фон вторичных кнопок
- `--theme-button-secondary-text` - текст вторичных кнопок
- `--theme-button-secondary-border` - граница вторичных кнопок

## Размещение форм

### Development (локальная разработка)
Формы размещаются в `public/payment-forms-example/`

### Production (S3)
1. Создайте S3 бакет
2. Загрузите HTML формы в папку `payment-forms/`
3. Настройте CORS для бакета:
```json
{
  "AllowedOrigins": ["https://your-domain.com"],
  "AllowedMethods": ["GET"],
  "AllowedHeaders": ["*"]
}
```
4. Обновите URL в `UniversalPaymentModal.tsx`:
```typescript
const baseUrl = 'https://your-s3-bucket.s3.amazonaws.com/payment-forms/';
```

## Добавление новой платежной системы

1. Создайте HTML файл формы (например, `newpay.html`)
2. Разместите файл в S3 или `public/payment-forms-example/`
3. API должно вернуть новую систему в списке:
```json
{
  "name": "newpay",
  "title": "NewPay",
  "descr": "Описание системы",
  "url_form": "newpay.html",
  "url_file": "newpay.cgi"
}
```
4. Система автоматически появится в списке и будет работать!

## Примеры форм

В папке `public/payment-forms-example/` находятся примеры для:
- `yoomoney.html` - ЮМани
- `yookassa.html` - ЮКасса  
- `wata.html` - Wata

## Обработка данных на бэкенде

POST `/shm/v1/admin/cloud/proxy/service/paysystem/configure`

Тело запроса:
```json
{
  "system": "yoomoney",
  "wallet": "410012345678901",
  "secret": "secret_key_here",
  "notification_url": "https://example.com/notify"
}
```

Ответ при успехе: `200 OK`
Ответ при ошибке: `400/500` с описанием ошибки
