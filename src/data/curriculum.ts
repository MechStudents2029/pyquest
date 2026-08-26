import type { Challenge, Day, HiddenTest, TestValue } from "../domain/types";
import { getLessonTeachingContent } from "./lessonContent";

const test = (
  label: string,
  functionName: string,
  args: readonly TestValue[],
  expected: TestValue,
): HiddenTest => ({ label, functionName, args, expected });

const challenge = (
  id: string,
  title: string,
  prompt: string,
  starterCode: string,
  hint: string,
  tests: readonly HiddenTest[],
  packages?: readonly string[],
): Challenge => ({
  id,
  title,
  prompt,
  starterCode,
  solutionCode: getSolutionCode(id),
  hint,
  tests,
  packages,
  xp: Number(id.split("-")[1]) % 5 === 0 ? 150 : 100,
});

const codeExamples: readonly string[] = [
  `city = "Oslo"
print("Next stop:", city)`,
  `scores = [8, 10, 7]
print(len(scores), max(scores))`,
  `minutes = 125
hours = minutes // 60
leftover = minutes % 60`,
  `label = "  Night Shift  "
clean_label = label.strip().lower()`,
  `tasks = ["scan", "report"]
tasks.append("archive")`,
  `point = (12, 4)
x, y = point
print(x + y)`,
  `visits = ["ada", "lin", "ada"]
unique_visitors = set(visits)`,
  `settings = {"theme": "dark"}
font_size = settings.get("font_size", 16)`,
  `temperature = 31
if temperature > 30:
    alert = "hot"
else:
    alert = "normal"`,
  `total = 0
for value in [3, 5, 8]:
    total += value`,
  `def welcome(name, greeting="Hello"):
    return greeting + ", " + name`,
  `import math

diagonal = math.sqrt(3 ** 2 + 4 ** 2)`,
  `names = ["ada", "lin", "grace"]
shouted = [name.upper() for name in names]`,
  `prices = [4, 9, 12]
labels = list(map(str, prices))`,
  `value = 12.5
if not isinstance(value, (int, float)):
    raise TypeError("number required")`,
  `from datetime import date

launch = date.fromisoformat("2026-08-24")`,
  `def parse_price(text):
    try:
        return float(text)
    except ValueError:
        return 0.0`,
  `import re

codes = re.findall(r"[A-Z]{2}\\d{3}", "IDs: AB123 and XY900")`,
  `from io import StringIO

stream = StringIO("alpha\\nbeta\\n")
first_line = stream.readline().strip()`,
  `import sys

print("Environment:", sys.prefix)
print("Python:", sys.version.split()[0])`,
  `class Counter:
    def __init__(self):
        self.value = 0

    def increment(self):
        self.value += 1`,
  `from html.parser import HTMLParser

class HeadingReader(HTMLParser):
    def handle_data(self, data):
        print(data.strip())`,
  `from html.parser import HTMLParser

class ImageReader(HTMLParser):
    def handle_starttag(self, tag, attrs):
        if tag == "img":
            print(dict(attrs).get("src"))`,
  `import statistics

times = [120, 135, 900]
typical = statistics.median(times)`,
  `import pandas as pd

frame = pd.DataFrame({"qty": [2, 3]})
total_qty = frame["qty"].sum()`,
  `def health():
    return {"service": "online"}

routes = {"/health": health}`,
  `import json

payload = json.loads('{"active": true}')
is_active = payload.get("active", False)`,
  `def error_response(message):
    return {"status": 400, "error": message}`,
  `def valid_email(payload):
    email = payload.get("email", "")
    return "@" in email`,
  `def subtotal(items):
    total = 0
    for item in items:
        total += item["price"] * item["qty"]
    return round(total, 2)`,
];

const solutionCodes: readonly string[] = [
  `def greet(name):
    return f"Hello, {name}!"`,
  `def word_count(s):
    return len(s.split())`,
  `def is_even(n):
    return n % 2 == 0`,
  `def slugify(text):
    return "-".join(text.lower().split())`,
  `def cart_summary(prices):
    return f"{len(prices)} items | \${sum(prices):.2f}"`,
  `def format_point(point):
    x, y = point
    return f"x={x}, y={y}"`,
  `def unique_count(values):
    return len(set(values))`,
  `def user_role(user):
    return user.get("role", "guest")`,
  `def shipping_cost(total, is_member):
    if is_member or total >= 50:
        return 0
    return 5`,
  `def valid_total(readings):
    total = 0
    for reading in readings:
        if reading >= 0 and reading % 2 == 0:
            total += reading
    return total`,
  `def clamp(value, low=0, high=100):
    return max(low, min(value, high))`,
  `import math

def circle_area(radius):
    return round(math.pi * radius ** 2, 2)`,
  `def even_squares(numbers):
    return [number ** 2 for number in numbers if number % 2 == 0]`,
  `def discounted(prices, rate):
    return list(map(lambda price: round(price * (1 - rate), 2), prices))`,
  `def safe_average(values):
    if not values:
        return "invalid"
    if any(isinstance(value, bool) or not isinstance(value, (int, float)) for value in values):
        return "invalid"
    return round(sum(values) / len(values), 2)`,
  `from datetime import date

def days_between(start, end):
    return (date.fromisoformat(end) - date.fromisoformat(start)).days`,
  `def safe_int(value):
    try:
        return int(value)
    except (ValueError, TypeError):
        return None`,
  `import re

def extract_hashtags(text):
    return re.findall(r"#(\\w+)", text)`,
  `from io import StringIO

def clean_lines(text):
    return [line for raw_line in StringIO(text) if (line := raw_line.strip())]`,
  `def package_names(text):
    names = []
    for raw_line in text.splitlines():
        line = raw_line.strip()
        if line and not line.startswith("#"):
            names.append(line.split("==", 1)[0].strip().lower())
    return names`,
  `class Wallet:
    def __init__(self, balance):
        self.balance = balance

    def apply(self, amount):
        self.balance += amount

def wallet_balance(start, changes):
    wallet = Wallet(start)
    for change in changes:
        wallet.apply(change)
    return wallet.balance`,
  `from html.parser import HTMLParser

class TitleParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_title = False
        self.parts = []

    def handle_starttag(self, tag, attrs):
        if tag == "title":
            self.in_title = True

    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False

    def handle_data(self, data):
        if self.in_title:
            self.parts.append(data)

def extract_title(html):
    parser = TitleParser()
    parser.feed(html)
    return "".join(parser.parts).strip()`,
  `from html.parser import HTMLParser

class LinkParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []

    def handle_starttag(self, tag, attrs):
        if tag == "a":
            href = dict(attrs).get("href")
            if href is not None:
                self.links.append(href)

def extract_links(html):
    parser = LinkParser()
    parser.feed(html)
    return parser.links`,
  `import statistics

def stats_summary(values):
    return {
        "mean": round(statistics.mean(values), 2),
        "median": round(statistics.median(values), 2),
    }`,
  `import pandas as pd

def completed_sales(rows):
    if not rows:
        return 0
    frame = pd.DataFrame(rows)
    completed = frame[frame["status"] == "completed"]
    return round(completed["amount"].sum(), 2)`,
  `def handle_request(method, path):
    if method == "GET" and path == "/health":
        return {"status": 200, "body": "ok"}
    return {"status": 404, "body": "not found"}`,
  `def active_user_names(response):
    if response.get("status") != 200:
        return []
    return [user["name"] for user in response.get("data", []) if user.get("active")]`,
  `def make_response(data, status=200):
    return {"status": status, "data": data}`,
  `def dispatch(method, path, payload):
    if method == "POST" and path == "/users":
        if not isinstance(payload, dict):
            return {"status": 400, "error": "name required"}
        name = payload.get("name")
        if not isinstance(name, str) or not name.strip():
            return {"status": 400, "error": "name required"}
        return {"status": 201, "data": {"name": name}}
    return {"status": 404, "error": "not found"}`,
  `def process_order(payload):
    if not isinstance(payload, dict):
        return {"status": 400, "error": "invalid items"}
    items = payload.get("items")
    if not isinstance(items, list) or not items:
        return {"status": 400, "error": "invalid items"}

    item_count = 0
    total = 0
    for item in items:
        if not isinstance(item, dict):
            return {"status": 400, "error": "invalid items"}
        name = item.get("name")
        price = item.get("price")
        qty = item.get("qty")
        valid_number = lambda value: isinstance(value, (int, float)) and not isinstance(value, bool)
        if (
            not isinstance(name, str)
            or not name.strip()
            or not valid_number(price)
            or price < 0
            or not isinstance(qty, int)
            or isinstance(qty, bool)
            or qty <= 0
        ):
            return {"status": 400, "error": "invalid items"}
        item_count += qty
        total += price * qty

    return {"status": 200, "data": {"item_count": item_count, "total": round(total, 2)}}`,
];

function getSolutionCode(challengeId: string): string {
  const dayNumber = Number(challengeId.split("-")[1]);
  const solutionCode = solutionCodes[dayNumber - 1];
  if (solutionCode === undefined) {
    throw new Error(`Missing solution for ${challengeId}`);
  }
  return solutionCode;
}

const day = (
  number: number,
  title: string,
  why: string,
  explanation: string,
  example: string,
  item: Challenge,
): Day => {
  const teaching = getLessonTeachingContent(number);
  return {
    day: number,
    title,
    topic: title,
    why,
    explanation: teaching.explanation || explanation,
    keyTerms: teaching.keyTerms,
    example,
    codeExample: getCodeExample(number),
    boss: number % 5 === 0,
    challenges: [item],
  };
};

function getCodeExample(dayNumber: number): string {
  const example = codeExamples[dayNumber - 1];
  if (example === undefined) {
    throw new Error(`Missing code example for day ${dayNumber}`);
  }
  return example;
}

export const curriculum: readonly Day[] = [
  day(
    1,
    "Variables & print()",
    "Names let programs remember values.",
    "A variable gives a value a useful name. Functions receive values through parameters and can return a new value to their caller.",
    'A support bot can turn the name "Adam" into a personal greeting.',
    challenge(
      "day-1-greet",
      "Signal hello",
      'Write greet(name) so it returns "Hello, {name}!".',
      `def greet(name):
    # Build and return the greeting
    pass`,
      "An f-string can place a variable inside text.",
      [
        test('greet("Adam")', "greet", ["Adam"], "Hello, Adam!"),
        test('greet("")', "greet", [""], "Hello, !"),
      ],
    ),
  ),
  day(
    2,
    "Built-in functions",
    "Python's built-ins solve common jobs without extra setup.",
    "Built-in functions such as len, min, and max are always available. Splitting text first turns its words into a list that len can count.",
    "A notes app can count words to estimate reading time.",
    challenge(
      "day-2-word-count",
      "Count the transmission",
      "Write word_count(s) that returns the number of whitespace-separated words.",
      `def word_count(s):
    # Split the text, then count the pieces
    pass`,
      "s.split() already handles repeated spaces and empty input.",
      [
        test('word_count("hello world")', "word_count", ["hello world"], 2),
        test('word_count("")', "word_count", [""], 0),
        test('word_count("one")', "word_count", ["one"], 1),
      ],
    ),
  ),
  day(
    3,
    "Operators",
    "Operators turn values into decisions and calculations.",
    "The modulus operator gives the remainder after division. Even integers have no remainder when divided by two.",
    "Alternating rows in a report often depend on whether an index is even.",
    challenge(
      "day-3-is-even",
      "Parity scanner",
      "Write is_even(n) using the modulus operator.",
      `def is_even(n):
    # Return a boolean
    pass`,
      "Compare n % 2 with zero.",
      [
        test("is_even(4)", "is_even", [4], true),
        test("is_even(7)", "is_even", [7], false),
        test("is_even(0)", "is_even", [0], true),
      ],
    ),
  ),
  day(
    4,
    "Strings",
    "Text cleanup makes names and URLs predictable.",
    "Strings have methods for changing case and splitting words. Joining cleaned words is a simple way to build a URL slug.",
    '"  Launch Code  " can become "launch-code".',
    challenge(
      "day-4-slugify",
      "Normalize a codename",
      "Write slugify(text) that trims whitespace, lowercases words, and joins them with hyphens.",
      `def slugify(text):
    # Normalize the text
    pass`,
      "Try '-'.join(text.lower().split()).",
      [
        test("basic slug", "slugify", ["Launch Code"], "launch-code"),
        test("messy spacing", "slugify", ["  Deep   Space  "], "deep-space"),
      ],
    ),
  ),
  day(
    5,
    "Lists · Boss battle",
    "Lists keep ordered collections that can grow and change.",
    "A list can hold every price in a cart. Combine list length, arithmetic, and formatted strings to produce a compact summary.",
    "Checkout screens show both item count and total price.",
    challenge(
      "day-5-cart-summary",
      "Cargo manifest",
      'Write cart_summary(prices) returning "{count} items | ${total:.2f}".',
      `def cart_summary(prices):
    # BOSS: combine lists, operators, and strings
    pass`,
      "len and sum do most of the calculation.",
      [
        test("three items", "cart_summary", [[2.5, 3, 4.25]], "3 items | $9.75"),
        test("empty cart", "cart_summary", [[]], "0 items | $0.00"),
      ],
    ),
  ),
  day(
    6,
    "Tuples",
    "Tuples group values that belong together.",
    "Tuple unpacking assigns each position a name. It is useful for fixed records such as coordinates or RGB colors.",
    "A map label can unpack x and y from one point.",
    challenge(
      "day-6-format-point",
      "Plot coordinates",
      'Write format_point(point) returning "x={x}, y={y}" after unpacking point.',
      `def format_point(point):
    # Unpack the two values
    pass`,
      "Start with x, y = point.",
      [
        test("positive point", "format_point", [[3, 7]], "x=3, y=7"),
        test("origin", "format_point", [[0, 0]], "x=0, y=0"),
      ],
    ),
  ),
  day(
    7,
    "Sets",
    "Sets remove duplicates and make membership checks fast.",
    "Converting a collection to a set keeps one copy of each distinct value. The result can then be counted.",
    "Analytics often count unique visitors instead of total visits.",
    challenge(
      "day-7-unique-count",
      "Deduplicate signals",
      "Write unique_count(values) that returns the number of distinct values.",
      `def unique_count(values):
    # Use a set
    pass`,
      "Build a set from values, then measure it.",
      [
        test("duplicates", "unique_count", [[1, 1, 2, 3, 3]], 3),
        test("empty", "unique_count", [[]], 0),
      ],
    ),
  ),
  day(
    8,
    "Dictionaries",
    "Dictionaries connect keys to values.",
    "Dictionary get() can retrieve a value and provide a fallback when the key is missing.",
    "A permissions screen can default an unknown user role to guest.",
    challenge(
      "day-8-user-role",
      "Read access level",
      'Write user_role(user) that returns user["role"], or "guest" when it is absent.',
      `def user_role(user):
    # Read the role safely
    pass`,
      "dict.get accepts a second argument for the default.",
      [
        test("admin", "user_role", [{ role: "admin" }], "admin"),
        test("missing role", "user_role", [{ name: "Mira" }], "guest"),
      ],
    ),
  ),
  day(
    9,
    "Conditionals",
    "Conditionals let code choose a path.",
    "if, elif, and else express business rules in order. Put the most specific or highest-priority rule first.",
    "A store can waive shipping for members or sufficiently large orders.",
    challenge(
      "day-9-shipping",
      "Route the parcel",
      "Write shipping_cost(total, is_member): return 0 for members or totals of at least 50, otherwise 5.",
      `def shipping_cost(total, is_member):
    # Choose the shipping price
    pass`,
      "Combine the free-shipping conditions with or.",
      [
        test("member", "shipping_cost", [10, true], 0),
        test("large order", "shipping_cost", [50, false], 0),
        test("standard order", "shipping_cost", [20, false], 5),
      ],
    ),
  ),
  day(
    10,
    "Loops · Boss battle",
    "Loops repeat a calculation over a sequence.",
    "A for loop can inspect each measurement, while a conditional decides whether it contributes to a running total.",
    "Monitoring software may total only valid, non-negative readings.",
    challenge(
      "day-10-valid-total",
      "Telemetry sweep",
      "Write valid_total(readings) that loops over readings and sums only non-negative even numbers.",
      `def valid_total(readings):
    # BOSS: loop, decide, and accumulate
    pass`,
      "Start total at zero, then use two conditions inside the loop.",
      [
        test("mixed readings", "valid_total", [[2, -4, 3, 8, 5]], 10),
        test("none valid", "valid_total", [[-2, 1, 3]], 0),
      ],
    ),
  ),
  day(
    11,
    "Functions",
    "Functions package rules behind a reusable name.",
    "Default parameters make common calls short while still allowing customization. A clamp keeps a value inside lower and upper limits.",
    "Volume sliders clamp values to a safe range.",
    challenge(
      "day-11-clamp",
      "Contain the value",
      "Write clamp(value, low=0, high=100) that keeps value inside the inclusive range.",
      `def clamp(value, low=0, high=100):
    # Return low, high, or value
    pass`,
      "min and max can express a clamp in one expression.",
      [
        test("inside", "clamp", [40], 40),
        test("below custom range", "clamp", [-5, 2, 8], 2),
        test("above", "clamp", [140], 100),
      ],
    ),
  ),
  day(
    12,
    "Modules",
    "Modules organize reusable tools.",
    "Python's math module provides constants and functions with well-known behavior. Import only what the function needs.",
    "Geometry software uses pi when calculating circular areas.",
    challenge(
      "day-12-circle-area",
      "Measure the orbit",
      "Write circle_area(radius) using math.pi and return the area rounded to two decimals.",
      `import math

def circle_area(radius):
    # Use math.pi
    pass`,
      "The area is pi multiplied by radius squared.",
      [
        test("unit circle", "circle_area", [1], 3.14),
        test("radius three", "circle_area", [3], 28.27),
      ],
    ),
  ),
  day(
    13,
    "List comprehensions",
    "Comprehensions build transformed lists compactly.",
    "A list comprehension can filter and transform in one readable expression. Keep it simple enough to understand at a glance.",
    "A chart pipeline might square only its even measurements.",
    challenge(
      "day-13-even-squares",
      "Transform the stream",
      "Write even_squares(numbers) with a list comprehension.",
      `def even_squares(numbers):
    # Filter evens and square them
    pass`,
      "Put the square before for and the even check after it.",
      [
        test("mixed", "even_squares", [[1, 2, 3, 4]], [4, 16]),
        test("empty", "even_squares", [[]], []),
      ],
    ),
  ),
  day(
    14,
    "Higher-order functions",
    "Functions can receive other functions and transform collections.",
    "map applies one function to every value. filter keeps values that satisfy a condition.",
    "Pricing systems apply the same discount rule across a catalog.",
    challenge(
      "day-14-discount",
      "Apply a pricing rule",
      "Write discounted(prices, rate) using map, rounding every result to two decimals.",
      `def discounted(prices, rate):
    # Use map with a lambda or named function
    pass`,
      "Map a lambda that multiplies each price by 1 - rate.",
      [
        test("ten percent", "discounted", [[10, 25], 0.1], [9, 22.5]),
        test("empty", "discounted", [[], 0.2], []),
      ],
    ),
  ),
  day(
    15,
    "Type errors · Boss battle",
    "Clear type rules prevent surprising calculations.",
    "Validate inputs before arithmetic. A useful function can reject booleans and text while accepting integers and floats.",
    "Data imports often contain a bad value among valid measurements.",
    challenge(
      "day-15-safe-average",
      "Stabilize the sensor array",
      'Write safe_average(values): return the rounded average, or "invalid" if any value is not int/float or the list is empty.',
      `def safe_average(values):
    # BOSS: validate, loop, and calculate
    pass`,
      "Remember that bool is a subclass of int, so reject it explicitly.",
      [
        test("valid", "safe_average", [[2, 3, 7]], 4),
        test("bad type", "safe_average", [[2, "3"]], "invalid"),
        test("empty", "safe_average", [[]], "invalid"),
      ],
    ),
  ),
  day(
    16,
    "Dates & times",
    "Date arithmetic turns calendar values into durations.",
    "datetime.date.fromisoformat reads an ISO date. Subtracting two dates gives a timedelta whose days value is easy to use.",
    "A project tracker can calculate the duration between milestones.",
    challenge(
      "day-16-days-between",
      "Calculate mission time",
      "Write days_between(start, end) for two YYYY-MM-DD strings.",
      `from datetime import date

def days_between(start, end):
    # Parse both dates and subtract
    pass`,
      "date.fromisoformat turns each string into a date.",
      [
        test("week", "days_between", ["2026-08-01", "2026-08-08"], 7),
        test("same day", "days_between", ["2026-01-01", "2026-01-01"], 0),
      ],
    ),
  ),
  day(
    17,
    "Exception handling",
    "Exceptions let code recover from expected failures.",
    "Catch the narrow exception you expect. Converting text to an integer raises ValueError when the text is not a valid integer.",
    "Form input arrives as text and needs safe conversion.",
    challenge(
      "day-17-safe-int",
      "Decode an integer",
      "Write safe_int(value) that returns an int or None when conversion raises ValueError or TypeError.",
      `def safe_int(value):
    # Catch only expected conversion errors
    pass`,
      "Wrap int(value) in try and except (ValueError, TypeError).",
      [
        test("number text", "safe_int", ["42"], 42),
        test("bad text", "safe_int", ["four"], null),
        test("none", "safe_int", [null], null),
      ],
    ),
  ),
  day(
    18,
    "Regular expressions",
    "Regex finds text that follows a pattern.",
    "re.findall returns every non-overlapping match. A hashtag can be modeled as a hash followed by one or more word characters.",
    "Social tools extract tags to build topic indexes.",
    challenge(
      "day-18-hashtags",
      "Scan the message",
      "Write extract_hashtags(text) returning hashtag words without the # character.",
      `import re

def extract_hashtags(text):
    # Find each hashtag
    pass`,
      "Use a capturing group after #: r'#(\\w+)'.",
      [
        test("two tags", "extract_hashtags", ["Ship #Python with #Pyodide"], ["Python", "Pyodide"]),
        test("no tags", "extract_hashtags", ["quiet channel"], []),
      ],
    ),
  ),
  day(
    19,
    "File handling",
    "Files turn program data into durable text.",
    "StringIO behaves like a text file in memory. It makes file-processing logic testable without touching a learner's disk.",
    "Import tools often ignore blank lines in uploaded files.",
    challenge(
      "day-19-clean-lines",
      "Read the log",
      "Write clean_lines(text) using io.StringIO. Return stripped, non-empty lines.",
      `from io import StringIO

def clean_lines(text):
    # Read the in-memory file
    pass`,
      "Loop over StringIO(text), strip each line, and keep truthy lines.",
      [
        test("mixed lines", "clean_lines", [" alpha\\n\\n beta \\n"], ["alpha", "beta"]),
        test("empty", "clean_lines", [""], []),
      ],
    ),
  ),
  day(
    20,
    "pip & virtual environments · Boss battle",
    "Dependency manifests make environments repeatable.",
    "A requirements file lists packages line by line. Useful parsers skip comments, blank lines, and version pins when producing package names.",
    "Build systems inspect manifests before installing dependencies.",
    challenge(
      "day-20-requirements",
      "Audit the environment",
      "Write package_names(text) returning lowercase names from requirement lines. Ignore blanks/comments and remove == version pins.",
      `def package_names(text):
    # BOSS: parse lines, filter, and normalize
    pass`,
      "Split into lines, strip each line, then split valid lines on '=='.",
      [
        test("manifest", "package_names", ["Requests==2.32\\n# tools\\nPandas\\n"], ["requests", "pandas"]),
        test("empty manifest", "package_names", [""], []),
      ],
    ),
  ),
  day(
    21,
    "Classes & objects",
    "Classes keep data and behavior together.",
    "An object stores state on self. Methods update or read that state through a clear interface.",
    "A wallet object can apply a sequence of deposits and withdrawals.",
    challenge(
      "day-21-wallet",
      "Model an account",
      "Complete Wallet and wallet_balance(start, changes). Each change should update the balance through a method.",
      `class Wallet:
    def __init__(self, balance):
        self.balance = balance

    def apply(self, amount):
        # Update this wallet
        pass

def wallet_balance(start, changes):
    # Create a Wallet, apply changes, return its balance
    pass`,
      "The wrapper should call wallet.apply(change) inside a loop.",
      [
        test("transactions", "wallet_balance", [10, [5, -3, 2]], 14),
        test("no changes", "wallet_balance", [7, []], 7),
      ],
    ),
  ),
  day(
    22,
    "Web scraping basics",
    "Scraping converts HTML into structured information.",
    "Python's HTMLParser can react when it enters a tag and collect the text inside it. The supplied HTML keeps this exercise offline.",
    "A link preview service reads a page title before displaying it.",
    challenge(
      "day-22-title",
      "Extract a page title",
      "Write extract_title(html) with HTMLParser. Return stripped title text or an empty string.",
      `from html.parser import HTMLParser

def extract_title(html):
    # Parse the supplied HTML without network access
    pass`,
      "A small HTMLParser subclass can track whether it is inside <title>.",
      [
        test("title", "extract_title", ["<html><title> PyQuest </title></html>"], "PyQuest"),
        test("missing", "extract_title", ["<p>No title</p>"], ""),
      ],
    ),
  ),
  day(
    23,
    "Data extraction pipelines",
    "A pipeline separates extraction from cleanup.",
    "HTMLParser exposes attributes as name-value pairs. Collect href values, then filter and normalize them.",
    "A crawler starts by collecting links from already-downloaded HTML.",
    challenge(
      "day-23-links",
      "Map local links",
      "Write extract_links(html) with HTMLParser, returning href values in source order.",
      `from html.parser import HTMLParser

def extract_links(html):
    # Collect href attributes
    pass`,
      "In handle_starttag, inspect attrs only when tag == 'a'.",
      [
        test("links", "extract_links", ['<a href="/a">A</a><a href="/b">B</a>'], ["/a", "/b"]),
        test("none", "extract_links", ["<p>Nothing</p>"], []),
      ],
    ),
  ),
  day(
    24,
    "Statistics",
    "Statistics summarize a collection without reading every value.",
    "The statistics module provides reliable mean and median functions. Median is often safer when data contains an extreme outlier.",
    "Response-time dashboards compare average and median latency.",
    challenge(
      "day-24-summary",
      "Summarize readings",
      'Write stats_summary(values) returning {"mean": ..., "median": ...}, rounded to two decimals.',
      `import statistics

def stats_summary(values):
    # Calculate two summaries
    pass`,
      "Use statistics.mean and statistics.median.",
      [
        test("odd list", "stats_summary", [[1, 2, 9]], { mean: 4, median: 2 }),
        test("even list", "stats_summary", [[2, 4, 6, 8]], { mean: 5, median: 5 }),
      ],
    ),
  ),
  day(
    25,
    "Pandas basics · Boss battle",
    "DataFrames make tabular calculations explicit.",
    "A DataFrame turns rows of dictionaries into named columns. Column filtering and sum can answer a business question in a few operations.",
    "Sales reports total only completed orders.",
    challenge(
      "day-25-sales",
      "Analyze the ledger",
      "Write completed_sales(rows) with pandas. Return the total amount where status is completed.",
      `import pandas as pd

def completed_sales(rows):
    # BOSS: build, filter, and aggregate a DataFrame
    pass`,
      "Create a DataFrame, filter df['status'] == 'completed', then sum amount.",
      [
        test(
          "mixed sales",
          "completed_sales",
          [[
            { status: "completed", amount: 12.5 },
            { status: "pending", amount: 99 },
            { status: "completed", amount: 7.5 },
          ]],
          20,
        ),
        test("no completed", "completed_sales", [[{ status: "pending", amount: 3 }]], 0),
      ],
      ["pandas"],
    ),
  ),
  day(
    26,
    "Flask & FastAPI basics",
    "Web frameworks route requests to handler functions.",
    "A handler receives request information and returns response data. We can practice that contract with a pure function.",
    "A health endpoint tells monitoring software whether an app is alive.",
    challenge(
      "day-26-handler",
      "Handle a request",
      'Write handle_request(method, path). Return {"status": 200, "body": "ok"} only for GET /health, otherwise a 404 response.',
      `def handle_request(method, path):
    # Simulate a tiny web route
    pass`,
      "Check both method and path before returning the success dictionary.",
      [
        test("health", "handle_request", ["GET", "/health"], { status: 200, body: "ok" }),
        test("missing", "handle_request", ["GET", "/other"], { status: 404, body: "not found" }),
      ],
    ),
  ),
  day(
    27,
    "API consumption",
    "API clients turn JSON responses into useful values.",
    "Decoded JSON is made of dictionaries, lists, strings, numbers, booleans, and null. Validate the status before reading nested data.",
    "A dashboard can list active users from a cached API response.",
    challenge(
      "day-27-active-users",
      "Read a response",
      "Write active_user_names(response). Return active user names when status is 200, otherwise an empty list.",
      `def active_user_names(response):
    # Read the supplied JSON-like dictionary
    pass`,
      "Guard the status first, then filter response['data'].",
      [
        test(
          "success",
          "active_user_names",
          [{ status: 200, data: [{ name: "Ada", active: true }, { name: "Lin", active: false }] }],
          ["Ada"],
        ),
        test("error response", "active_user_names", [{ status: 500, data: [] }], []),
      ],
    ),
  ),
  day(
    28,
    "API response building",
    "Consistent response shapes make APIs easier to use.",
    "An API response usually pairs a status code with JSON-compatible data. Keep keys and types consistent across handlers.",
    "A creation endpoint returns the new record and a 201 status.",
    challenge(
      "day-28-response",
      "Build a response",
      'Write make_response(data, status=200) returning {"status": status, "data": data}.',
      `def make_response(data, status=200):
    # Return a JSON-compatible response dictionary
    pass`,
      "Construct and return one dictionary with two keys.",
      [
        test("default", "make_response", [{ ok: true }], { status: 200, data: { ok: true } }),
        test("created", "make_response", [{ id: 3 }, 201], { status: 201, data: { id: 3 } }),
      ],
    ),
  ),
  day(
    29,
    "API routing & validation",
    "Validation keeps bad input out of application logic.",
    "A router chooses a handler from method and path. The handler then checks required fields before building its response.",
    "A users endpoint rejects a request that has no name.",
    challenge(
      "day-29-dispatch",
      "Dispatch the endpoint",
      "Write dispatch(method, path, payload): POST /users with a non-empty name returns 201 and the name; bad payload returns 400; all else returns 404.",
      `def dispatch(method, path, payload):
    # Route, validate, and build a response
    pass`,
      "Handle the matching route first, then validate payload.get('name').",
      [
        test("created", "dispatch", ["POST", "/users", { name: "Nia" }], { status: 201, data: { name: "Nia" } }),
        test("invalid", "dispatch", ["POST", "/users", {}], { status: 400, error: "name required" }),
        test("missing route", "dispatch", ["GET", "/users", {}], { status: 404, error: "not found" }),
      ],
    ),
  ),
  day(
    30,
    "Final API · Boss battle",
    "A complete feature combines validation, transformation, and response design.",
    "Real endpoints rarely do one thing. This final quest validates request data, calculates an order total, and returns a stable API response.",
    "An order service totals line items only after checking the request shape.",
    challenge(
      "day-30-orders",
      "Launch the service",
      "Write process_order(payload). Validate a non-empty items list of {name, price, qty}; return 400 on invalid input or 200 with item_count and total rounded to two decimals.",
      `def process_order(payload):
    # FINAL BOSS: validate, loop, calculate, and respond
    pass`,
      "Reject early, then accumulate quantity and price * quantity for each item.",
      [
        test(
          "valid order",
          "process_order",
          [{ items: [{ name: "cable", price: 2.5, qty: 2 }, { name: "chip", price: 4, qty: 1 }] }],
          { status: 200, data: { item_count: 3, total: 9 } },
        ),
        test("empty order", "process_order", [{ items: [] }], { status: 400, error: "invalid items" }),
        test("missing items", "process_order", [{}], { status: 400, error: "invalid items" }),
      ],
    ),
  ),
];

export function getDay(dayNumber: number): Day {
  const found = curriculum[dayNumber - 1];
  if (found === undefined || found.day !== dayNumber) {
    throw new Error(`Unknown curriculum day: ${dayNumber}`);
  }
  return found;
}
