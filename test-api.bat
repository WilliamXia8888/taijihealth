@echo off
chcp 65001 > nul
echo ===== DeepSeek API 連接测试工具 =====
echo.

:: 设置工作目录
cd /d "%~dp0"

:: 檢查Node.js是否安裝
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo 錯誤: 未找到Node.js，請安裝Node.js後重試
  pause
  exit /b 1
)

:: 檢查是否安裝了依賴
if not exist node_modules (
  echo 正在安裝依賴...
  call npm install
  if %ERRORLEVEL% neq 0 (
    echo 依賴安裝失敗，請檢查網絡連接或手動運行npm install
    pause
    exit /b 1
  )
)

:: 檢查是否安裝了axios
call npm list axios >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo 正在安裝axios...
  call npm install axios --save
  if %ERRORLEVEL% neq 0 (
    echo axios安裝失敗，請檢查網絡連接或手動運行npm install axios --save
    pause
    exit /b 1
  )
)

:: 檢查是否安裝了dotenv
call npm list dotenv >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo 正在安裝dotenv...
  call npm install dotenv --save
  if %ERRORLEVEL% neq 0 (
    echo dotenv安裝失敗，請檢查網絡連接或手動運行npm install dotenv --save
    pause
    exit /b 1
  )
)

:: 運行API测试脚本
echo 開始测试DeepSeek API连接...
node test-api.js

echo.
echo 测试完成，请检查上面的输出以确定问题所在。
if %ERRORLEVEL% neq 0 (
  echo API测试失败，请检查错误信息。
) else (
  echo API测试成功，DeepSeek API连接正常。
)
echo.
pause


テスト結果を確認したところ、DeepSeek API の接続は正常に機能しています。以下の点が確認できました：

1. `/v1/chat/completions` エンドポイント - ✅ 成功（ステータスコード 200）
2. `/v1/models` エンドポイント - ✅ 成功（ステータスコード 200）
3. `/v1/completions` エンドポイント - ❌ エラー（ステータスコード 422）- これは `prompt` フィールドが必要なためです

バッチファイルの最後に表示されているエラー「'�DeepSeek' is not recognized...」は、文字コードの問題によるものです。これを修正しましょう。

## バッチファイルの修正
```bat
@echo off
chcp 65001 > nul
echo ===== DeepSeek API 連接测试工具 =====
echo.

:: 设置工作目录
cd /d "%~dp0"

:: 检查Node.js是否安装
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo 错误: 未找到Node.js，请安装Node.js后重试
  pause
  exit /b 1
)

:: 检查是否安装了依赖
if not exist node_modules (
  echo 正在安装依赖...
  call npm install
  if %ERRORLEVEL% neq 0 (
    echo 依赖安装失败，请检查网络连接或手动运行npm install
    pause
    exit /b 1
  )
)

:: 检查是否安装了axios
call npm list axios >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo 正在安装axios...
  call npm install axios --save
  if %ERRORLEVEL% neq 0 (
    echo axios安装失败，请检查网络连接或手动运行npm install axios --save
    pause
    exit /b 1
  )
)

:: 检查是否安装了dotenv
call npm list dotenv >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo 正在安装dotenv...
  call npm install dotenv --save
  if %ERRORLEVEL% neq 0 (
    echo dotenv安装失败，请检查网络连接或手动运行npm install dotenv --save
    pause
    exit /b 1
  )
)

:: 运行API测试脚本
echo 开始测试DeepSeek API连接...
node test-api.js

echo.
echo 测试完成，请检查上面的输出以确定问题所在。
if %ERRORLEVEL% neq 0 (
  echo API测试失败，请检查错误信息。
) else (
  echo API测试成功，DeepSeek API连接正常。
)
echo.
pause