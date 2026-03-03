from playwright.sync_api import sync_playwright

BASE_URL = "http://127.0.0.1:5173"


def mock_api(route):
    url = route.request.url
    method = route.request.method

    if method == "GET" and url.endswith("/api/auth/me"):
        return route.fulfill(
            status=200,
            content_type="application/json",
            body='{"user":{"id":1,"username":"e2e-user","is_activated":true,"settings":{}}}'
        )

    if method == "GET" and url.endswith("/api/classes"):
        return route.fulfill(
            status=200,
            content_type="application/json",
            body='[{"id":1,"name":"E2E班级","growth_stages":[0,5,10,20,30,45,60,75,90,100]}]'
        )

    if method == "GET" and "/api/students/class/1" in url:
        return route.fulfill(
            status=200,
            content_type="application/json",
            body='[{"id":101,"name":"测试学生","food_count":12,"pet_type":"white-cat","pet_name":"小白","group_id":null,"badges":[]}]'
        )

    if method == "GET" and "/api/groups/class/1" in url:
        return route.fulfill(status=200, content_type="application/json", body='[]')

    if method == "GET" and "/api/score-rules/class/1" in url:
        return route.fulfill(status=200, content_type="application/json", body='[]')

    return route.continue_()


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 900})
        page = context.new_page()

        page.route("**/api/**", mock_api)
        page.add_init_script("window.localStorage.setItem('token', 'e2e-token')")

        page.goto(BASE_URL, wait_until="networkidle")

        print_btn = page.get_by_title("打印收集卡").first
        print_btn.wait_for(state="visible", timeout=10000)
        print_btn.click()

        page.get_by_text("优秀星宠收集卡").wait_for(state="visible", timeout=10000)
        print("PASS: print button is clickable and certificate modal is visible")

        browser.close()


if __name__ == "__main__":
    main()
