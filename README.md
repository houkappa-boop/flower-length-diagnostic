# 花房隔離長度診斷

獨立測試服務，不匯入正式花房程式，不配置資料庫、邀請驗證、額度模組、秘密或環境群組。

只使用公開 ASCII 測試字串（43 字元）：

`PUBLIC_TEST_ONLY_0123456789_ABCDEFGHIJKLMNO`

它不是邀請碼，不能在本服務取得任何登入權限。不要向正式花房驗證端點提交它。

## 執行

`npm test` 執行正規化與 HTTP 接收測試；`npm start` 啟動服務。無第三方相依套件。Render 使用 Free Web Service，build command `npm test`，start command `npm start`，不配置環境群組、磁碟或資料庫。

## 測试流程

同一支 Android 手機在 LINE 內建瀏覽器及 Chrome 各測一次。從自己的 LINE 訊息複製公開字串，再貼到診斷頁並送出。比較貼上、輸入框、正規化、序列化、接收端長度。完整字串預期各階段 43；刻意截短為前 37 字元時預期各階段 37。外層空白及一組成對引號按現行入口規則移除。

## 隱私範圍與限制

前端只暫存長度結果；不使用 localStorage、sessionStorage、Cookie、分析工具或外部資源。不保存剪貼簿原文。送出前只允許公開字串或它的非空截短版本；其他內容清空且不送出。請求不帶 Cookie，不跟隨轉址、不带 referrer。服務端不記錄請求、IP、Cookie、本文或錯誤內容，只回傳公開測試值的長度；沒有持久儲存。非法直接請求會被拒絕，不回顯內容。

獨立流程使用 FormData + URLSearchParams + fetch 以避免 Cookie，並非正式入口的原生頁面導覽 POST。結果只定位本測試的階段，不能證明正式流程或特定 LINE 版本沒有問題。桌面瀏覽器測試不能替代 Android 實測。

Render Hobby 不提供 Pro HTTP request logs。這不構成平台內部不留 IP 或安全紀錄的保證；平台層紀錄不由本程式控制。若要求供應商全層零 IP 留存，必須先取得 Render 的明確保證。

## 關閉

完成手機比較後，可在這個獨立 Render 服務 Settings 的 Suspend Service 暫停服務；確認不再需要時再刪除。不要操作正式花房服務。Free 無固定主機費，但仍共用帳號免費流量與建置額度；閒置會休眠，首次載入可能等待。
