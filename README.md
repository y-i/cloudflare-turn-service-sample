# cloudflare-turn-service-sample
CloudflareのTURN as a serviceを使ってみた

# 使い方

1. リポジトリをClone
2. https://dash.cloudflare.com/?to=/:account/calls から`TURN service token`を作成し、`manin.js`に書く
3. ローカルでHTTPサーバを起動
   - `python3 -m http.server 8080` など
4. `index.html`にアクセスし、コンソールに`answer:  hello`が表示されれば成功
