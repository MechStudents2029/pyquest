import type { KeyTerm } from "../domain/types";

interface LessonTeachingContent {
  readonly explanation: string;
  readonly keyTerms: readonly KeyTerm[];
}

const lessonTeachingContent: readonly LessonTeachingContent[] = [
  {
    explanation:
      "A variable is a name that refers to a value, much like a labeled drawer tells you what is stored inside without becoming the object itself. Assignment with = connects the name on the left to the value on the right. Python can later reassign that name to another value. print() displays a value, while return sends a result from a function back to its caller. In this challenge, name is a parameter: each call supplies an argument, and your function must return a new greeting string even when that argument is empty.",
    keyTerms: [
      { term: "Variable", definition: "A name that refers to a value currently stored by the program." },
      { term: "Assignment", definition: "The act of binding a name to a value with the = operator." },
      { term: "Parameter", definition: "A local name in a function definition that receives an argument." },
      { term: "Return value", definition: "The result a function sends back to the code that called it." },
    ],
  },
  {
    explanation:
      "A built-in function is part of Python's standard language environment, so you can call it without importing a module. Think of built-ins as tools already laid out on the workbench. len() counts items, while min() and max() choose boundary values. Methods such as str.split() belong to a particular type rather than the global toolbox. With no separator, split() treats runs of whitespace as one boundary and returns an empty list for blank text. The challenge combines that behavior with len(), so repeated spaces and empty input need no special branch.",
    keyTerms: [
      { term: "Built-in function", definition: "A function Python makes available without an import statement." },
      { term: "Method", definition: "A function attached to a type and called through one of its values." },
      { term: "Whitespace", definition: "Spacing characters such as spaces, tabs, and line breaks." },
    ],
  },
  {
    explanation:
      "An operator is syntax that asks Python to compute with values. Arithmetic operators produce numbers, comparison operators produce booleans, and boolean operators combine conditions. The modulus operator % returns the remainder after division. Picture dealing cards into two equal piles: an even count leaves no card behind, so n % 2 equals 0. This rule works for zero and negative integers as well. Your function should return the comparison itself, a boolean, rather than translating it through an unnecessary if statement.",
    keyTerms: [
      { term: "Operator", definition: "A symbol or keyword that performs an operation on one or more values." },
      { term: "Modulus", definition: "The % operator, which returns the remainder from division." },
      { term: "Boolean", definition: "The logical value True or False, often produced by a comparison." },
    ],
  },
  {
    explanation:
      "A string is an immutable sequence of Unicode characters. Immutable means string methods never edit the original text; they return new strings. strip() removes whitespace at the ends, lower() normalizes letter case, and split() separates text into words. join() then combines an iterable of strings with a chosen separator. Treat the process like an assembly line: clean, divide, then reconnect. That order matters for the challenge because splitting without an explicit separator also collapses repeated whitespace, giving a predictable slug without manual loops.",
    keyTerms: [
      { term: "String", definition: "An immutable sequence of Unicode characters used to represent text." },
      { term: "Immutable", definition: "Unable to change in place after creation; operations produce a new value." },
      { term: "Method chain", definition: "A sequence of method calls where each result feeds the next call." },
    ],
  },
  {
    explanation:
      "A list is an ordered, mutable collection. Ordered means positions are stable and accessed by zero-based indexes; mutable means append(), assignment, and other operations can change the same list object. That differs from strings and tuples, which produce new values instead of changing in place. A useful mental model is a numbered row of storage bins that can be filled, replaced, or extended. The boss challenge reads the collection without mutating it: len() finds the item count and sum() accumulates prices. Formatting to two decimal places controls presentation, not the underlying numeric value.",
    keyTerms: [
      { term: "List", definition: "An ordered, mutable collection whose items can have different types." },
      { term: "Mutable", definition: "Able to change in place while retaining the same object identity." },
      { term: "Index", definition: "A zero-based integer position used to access an item in a sequence." },
      { term: "Accumulator", definition: "A value updated repeatedly to collect a running result such as a sum." },
    ],
  },
  {
    explanation:
      "A tuple is an ordered, immutable collection. It supports indexing like a list, but you cannot replace, add, or remove its items. Tuples fit records whose structure should stay fixed, such as an x-y coordinate. Sequence unpacking assigns corresponding positions to names in one statement. Think of opening a two-slot coordinate case and labeling each slot x and y. The number of targets must match the number of items or Python raises ValueError. In this challenge, unpack the supplied point, then format the two values without changing the original record.",
    keyTerms: [
      { term: "Tuple", definition: "An ordered, immutable collection commonly used for fixed-size records." },
      { term: "Unpacking", definition: "Assigning items from a collection to several names in one statement." },
      { term: "Arity", definition: "The number of values or arguments expected by an operation or structure." },
    ],
  },
  {
    explanation:
      "A set is a mutable collection of unique, hashable values. Adding a duplicate has no effect, which makes a set act like a guest list where each name appears once. Membership checks are usually fast, but a set is not a sequence: it has no indexes, and you must not rely on its iteration order for presentation. Values such as numbers and strings can be members, while mutable lists cannot because they are not hashable. The challenge only needs cardinality, so converting the input to a set and measuring it expresses the intent directly.",
    keyTerms: [
      { term: "Set", definition: "A collection that stores at most one copy of each hashable value." },
      { term: "Hashable", definition: "Having a stable hash value so an object can be stored in a set or used as a key." },
      { term: "Cardinality", definition: "The number of distinct members contained in a set." },
    ],
  },
  {
    explanation:
      "A dictionary maps unique, hashable keys to values. It is closer to a labeled index than a numbered sequence: user[\"role\"] asks for one exact label. Direct indexing raises KeyError when the key is absent, while get() can return a chosen default. Dictionaries preserve insertion order in modern Python, but lookup logic should depend on keys rather than positions. Keys must be hashable, so strings and numbers work while lists do not. The challenge uses get() because a missing role is expected input, not an exceptional program failure.",
    keyTerms: [
      { term: "Dictionary", definition: "A mutable mapping that associates unique keys with corresponding values." },
      { term: "Key", definition: "A hashable value used to locate an associated value in a mapping." },
      { term: "Default value", definition: "A fallback result used when requested data is absent." },
    ],
  },
  {
    explanation:
      "A conditional chooses which block runs based on a boolean condition. Python checks if and elif branches from top to bottom and executes only the first true branch; else handles everything left over. Values also have truthiness: empty strings, empty collections, zero, and None count as false, while most other values count as true. Imagine rules at an airport checkpoint, where the first matching rule decides the route. In the challenge, either membership or a large enough total grants free shipping, so the boolean operator or combines those independent reasons.",
    keyTerms: [
      { term: "Conditional", definition: "A control structure that selects code to run based on a condition." },
      { term: "Truthiness", definition: "The way Python interprets any value as true or false in a condition." },
      { term: "Short-circuiting", definition: "Stopping a boolean expression once its final result is already known." },
    ],
  },
  {
    explanation:
      "A loop repeats a block of code. A for loop takes each item from an iterable and stops when that iterable is exhausted; a while loop continues while its condition remains true and therefore needs a state change that guarantees termination. Accumulation starts with an identity value, such as 0 for addition, then updates it for selected items. Picture a quality-control conveyor belt: inspect one reading, keep it only if it passes both tests, then add it to the running total. The challenge requires non-negative even values, including zero, and the loop naturally handles an empty input.",
    keyTerms: [
      { term: "Loop", definition: "A control structure that repeats a block of code." },
      { term: "Iterable", definition: "An object that can provide its items one at a time to a loop." },
      { term: "Termination", definition: "The condition or event that causes repeated execution to stop." },
      { term: "Running total", definition: "An accumulator updated as each relevant item is processed." },
    ],
  },
  {
    explanation:
      "A function gives a computation a name and a local scope. Parameters describe its inputs, arguments are the values supplied by a call, and return sends one result to the caller. A default parameter is evaluated when the function is defined and is used only when that argument is omitted; mutable defaults deserve special care because calls can share them. Local names normally disappear after the call, so a function should communicate through its return value rather than hidden state. For this challenge, clamping means choosing the nearest legal boundary when value falls outside the inclusive range.",
    keyTerms: [
      { term: "Function", definition: "A named, reusable block of code that can receive inputs and return a result." },
      { term: "Argument", definition: "A value supplied to a parameter when a function is called." },
      { term: "Default parameter", definition: "A parameter value used when the caller omits that argument." },
      { term: "Local scope", definition: "The region inside a function where its local names are visible." },
    ],
  },
  {
    explanation:
      "A module is a Python file or built-in unit that groups related names. import math binds the module name, so math.pi makes the source of pi explicit. A from import binds selected names directly, which is shorter but can make collisions less obvious. Python loads a module once per process and caches it for later imports. Think of a module as a labeled tool cabinet rather than dumping every tool onto the floor. The challenge should use math.pi for the circle constant, exponentiation for radius squared, and round only the final area to avoid compounding rounding error.",
    keyTerms: [
      { term: "Module", definition: "A unit of Python code that groups related functions, classes, and values." },
      { term: "Import", definition: "The statement that loads a module and binds one or more of its names." },
      { term: "Namespace", definition: "A mapping that keeps names organized and helps prevent naming collisions." },
    ],
  },
  {
    explanation:
      "A list comprehension constructs a new list from an iterable. Read its core form as output expression, then for each item, then an optional filter: [transform(x) for x in source if condition(x)]. It does not mutate the source. Picture a small pipeline written left to right around a loop: select eligible items and shape each result. Comprehensions are best when that transformation stays simple; nested branches often deserve a regular loop. The challenge filters even numbers with the trailing if clause and squares each accepted number in the leading expression, preserving source order.",
    keyTerms: [
      { term: "Comprehension", definition: "Compact syntax that builds a new collection by iterating over another iterable." },
      { term: "Filter clause", definition: "The optional if portion that decides which source items enter the result." },
      { term: "Transformation", definition: "An expression that converts each selected input into an output value." },
    ],
  },
  {
    explanation:
      "A higher-order function accepts a function as an argument, returns one, or both. map() applies a transformation lazily to every item and returns an iterator, so list() is needed when the required result is a list. filter() keeps items for which a predicate is truthy. A lambda is a small anonymous function limited to one expression; use a named function when the rule needs explanation. Think of passing a recipe to a machine rather than passing the finished products. The challenge supplies the pricing rule to map(), then rounds each calculated price to control floating-point presentation.",
    keyTerms: [
      { term: "Higher-order function", definition: "A function that receives another function or returns one as a result." },
      { term: "Lambda", definition: "A small anonymous function written as a single expression." },
      { term: "Iterator", definition: "An object that produces values one at a time and is consumed as it advances." },
      { term: "Predicate", definition: "A function or expression whose truth value decides whether an item qualifies." },
    ],
  },
  {
    explanation:
      "A type describes the operations a value supports, and a TypeError signals that an operation received an inappropriate type. Validation checks assumptions at the boundary before calculation starts. Python has a subtle edge case here: bool is a subclass of int, so isinstance(True, int) is true even though a sensor reading of True is probably invalid. Also guard the empty list before dividing, or the denominator becomes zero. Treat validation like checking every instrument before takeoff. The challenge should reject early on either bad condition and calculate the average only when every reading is a non-boolean number.",
    keyTerms: [
      { term: "Type", definition: "A category that determines which operations and behaviors a value supports." },
      { term: "TypeError", definition: "An exception raised when an operation receives a value of an unsuitable type." },
      { term: "Validation", definition: "Checking that input satisfies required rules before processing it." },
      { term: "Subclass", definition: "A type that inherits behavior from another type and may specialize it." },
    ],
  },
  {
    explanation:
      "A date represents a calendar day without a time of day or time zone. ISO 8601 date text uses YYYY-MM-DD, and date.fromisoformat() parses that exact shape or raises ValueError for invalid input. Subtracting two dates returns a timedelta, a duration whose .days attribute is an integer. Think of dates as marked squares on a calendar and the timedelta as the number of steps between them. Subtraction is directional, so reversing start and end produces a negative result. The challenge should parse both boundaries and return their signed difference without manually counting month lengths or leap days.",
    keyTerms: [
      { term: "Date", definition: "A calendar value containing a year, month, and day without a clock time." },
      { term: "ISO 8601", definition: "A standard date representation that commonly uses the YYYY-MM-DD format." },
      { term: "Timedelta", definition: "A duration produced by date or datetime arithmetic." },
    ],
  },
  {
    explanation:
      "An exception is an object that interrupts normal control flow when an operation cannot continue. A try block contains the risky operation; except handles named failure types. Catch the narrowest expected exceptions so programming mistakes such as NameError are not silently disguised as bad user input. int() raises ValueError for text with the wrong form and TypeError for values it cannot interpret at all. The mental model is a circuit breaker for a known fault, not a blanket over every alarm. This challenge handles those two conversion failures and uses None as an explicit sentinel meaning no integer result.",
    keyTerms: [
      { term: "Exception", definition: "An object representing an error that interrupts the current control flow." },
      { term: "try/except", definition: "Syntax for attempting an operation and handling named exception types." },
      { term: "Sentinel", definition: "A special value used to represent a distinct state such as no valid result." },
    ],
  },
  {
    explanation:
      "A regular expression describes a language of text patterns. Literal characters match themselves, while metacharacters such as \\w and + mean classes and repetition. re.findall() scans left to right and returns non-overlapping matches; if the pattern contains a capturing group, it returns the captured portion rather than the full match. Use raw strings so Python does not consume backslashes before the regex engine sees them. Think of regex as a stencil, precise but limited. In this challenge, #(\\w+) captures one or more Unicode word characters after #, but it will stop at punctuation or a hyphen.",
    keyTerms: [
      { term: "Regular expression", definition: "A compact pattern language used to search and validate text." },
      { term: "Capturing group", definition: "A parenthesized part of a regex whose matched text is returned separately." },
      { term: "Raw string", definition: "A Python string literal that preserves backslashes for another parser." },
      { term: "Non-overlapping", definition: "Matches that do not reuse characters already consumed by a previous match." },
    ],
  },
  {
    explanation:
      "A file is a persistent sequence of bytes, while a text stream decodes those bytes into characters and exposes read operations. StringIO implements the same text-stream interface entirely in memory, which makes this lesson deterministic and safe in the browser. Iterating over a stream yields lines including their newline characters. strip() removes surrounding whitespace, and an empty stripped string is falsy. With real files, use with open(...) so the context manager closes the operating-system resource even if an exception occurs. Here StringIO needs no disk cleanup, but the line-processing logic is the same.",
    keyTerms: [
      { term: "Text stream", definition: "An interface that reads or writes character data sequentially." },
      { term: "StringIO", definition: "An in-memory text stream that behaves much like an open text file." },
      { term: "Context manager", definition: "An object used by with to acquire and reliably release a resource." },
      { term: "Truthiness", definition: "The rule that makes an empty string false and a non-empty string true." },
    ],
  },
  {
    explanation:
      "pip installs Python distributions, while a virtual environment gives one project an isolated interpreter and package directory. Isolation prevents project A's version choices from silently changing project B. A requirements file is a reproducibility input, though exact locks and hashes are stronger than loose names. Think of each virtual environment as a separate laboratory bench with its own labeled supplies. This browser challenge does not install anything; it parses a simplified manifest. Ignore comments and blank lines, normalize package names to lowercase, and remove the supported == version pin without pretending to handle every valid requirement syntax.",
    keyTerms: [
      { term: "pip", definition: "Python's standard command-line installer for packages from package indexes." },
      { term: "Virtual environment", definition: "An isolated Python installation and package directory for one project." },
      { term: "Dependency", definition: "An external package that a project requires to run or build." },
      { term: "Version pin", definition: "A requirement that selects a specific package version, such as ==2.32." },
    ],
  },
  {
    explanation:
      "A class defines how a family of objects stores state and responds to operations. An instance is one concrete object. __init__ initializes that instance, self refers to the receiver of the current method call, and attributes such as self.balance hold per-instance state. A method can enforce how that state changes instead of letting every caller manipulate it directly. Picture a class as a blueprint and each wallet as a separate built object with its own balance. The challenge must create one Wallet, send every change through apply(), then read the resulting state; creating a new object inside the loop would lose prior updates.",
    keyTerms: [
      { term: "Class", definition: "A definition that specifies the state and behavior shared by its instances." },
      { term: "Instance", definition: "A concrete object created from a class definition." },
      { term: "Attribute", definition: "A named piece of state stored on an object." },
      { term: "Method", definition: "A function defined on a class that operates on an instance or the class." },
    ],
  },
  {
    explanation:
      "Web scraping extracts structured facts from HTML, a markup language whose nested tags form a document tree. HTMLParser is event-driven: it calls methods when start tags, end tags, and text appear. A small parser can track whether the current text belongs inside title and collect the relevant data. Think of the parser as a reader announcing each structural event instead of handing you the whole page at once. Real-world HTML can contain malformed markup, scripts, multiple text chunks, encodings, and legal or rate-limit constraints. This offline challenge focuses only on title text and should return an empty string when no title exists.",
    keyTerms: [
      { term: "HTML", definition: "A markup language that describes the structure and content of web documents." },
      { term: "Parser", definition: "A program that reads structured input and turns it into meaningful events or data." },
      { term: "Start tag", definition: "Markup such as <title> that begins an HTML element." },
      { term: "Parser state", definition: "Information retained between parsing events, such as whether a title is open." },
    ],
  },
  {
    explanation:
      "A data extraction pipeline separates stages such as parsing, selecting, normalizing, and storing. That separation makes each rule easier to test and replace. HTMLParser supplies tag attributes as name-value pairs, and converting those pairs to a dictionary can simplify lookup, though duplicate attributes would be collapsed. Source order matters for this challenge, so append each href as its anchor tag arrives. Picture a sorting line where every station has one job. A production crawler would also resolve relative URLs, reject unsafe schemes, honor robots rules, and deduplicate links, but this exercise deliberately extracts the raw href values only.",
    keyTerms: [
      { term: "Pipeline", definition: "A sequence of processing stages where each stage has one defined job." },
      { term: "Attribute", definition: "A name-value detail inside an HTML start tag, such as href=\"/a\"." },
      { term: "Extraction", definition: "Selecting specific information from a larger source document." },
      { term: "Normalization", definition: "Converting equivalent inputs into one consistent representation." },
    ],
  },
  {
    explanation:
      "Descriptive statistics summarize a sample or population, but a summary always discards detail. The arithmetic mean adds values and divides by the count, so every observation influences it. The median is the middle ordered value, or the mean of the two middle values, and resists extreme outliers better. Think of mean as the balance point of a seesaw and median as the person standing in the middle of a line. Neither is automatically the correct notion of typical. The challenge computes both for non-empty input and rounds the reported results; interpreting why they differ still requires looking at the data's shape and units.",
    keyTerms: [
      { term: "Mean", definition: "The sum of numeric observations divided by the number of observations." },
      { term: "Median", definition: "The middle value after sorting, or the mean of two middle values." },
      { term: "Outlier", definition: "An observation unusually far from most other values in the data." },
      { term: "Aggregation", definition: "A calculation that reduces many values to a smaller summary." },
    ],
  },
  {
    explanation:
      "A pandas DataFrame is a two-dimensional labeled table. Each column is a Series with a data type, and a boolean comparison such as df[\"status\"] == \"completed\" produces a mask containing True or False for every row. Using that mask inside df[...] selects matching rows; selecting amount and calling sum() then aggregates one column. Think of the mask as a transparent stencil laid over the table. Empty inputs and missing columns need explicit policy in production, and mixed types can change behavior. The challenge's rows have a fixed schema, so build the frame, filter with the aligned mask, and sum only completed amounts.",
    keyTerms: [
      { term: "DataFrame", definition: "A two-dimensional pandas table with labeled rows and columns." },
      { term: "Series", definition: "A one-dimensional labeled pandas array, often representing one column." },
      { term: "Boolean mask", definition: "A True-or-False sequence used to select matching rows." },
      { term: "Aggregation", definition: "An operation such as sum that combines many rows into a summary value." },
    ],
  },
  {
    explanation:
      "A web framework maps an HTTP request to a handler function and turns the handler's result into an HTTP response. The method states the requested operation: GET reads, POST commonly creates, PUT replaces, PATCH partially updates, and DELETE removes. The path identifies a resource. Status codes describe outcomes, with 2xx for success, 4xx for client problems, and 5xx for server failures. Picture routing as a switchboard matching both method and path. This browser exercise models the contract as a pure function: only GET /health is a known route, and every other combination returns a 404 response.",
    keyTerms: [
      { term: "HTTP method", definition: "A request verb such as GET or POST that states the intended operation." },
      { term: "Route", definition: "A method-and-path pattern connected to a request handler." },
      { term: "Handler", definition: "A function that processes a request and produces response data." },
      { term: "Status code", definition: "A three-digit HTTP number that classifies the outcome of a request." },
    ],
  },
  {
    explanation:
      "An API client sends a request, receives an HTTP response, and interprets its body. JSON is a text format whose decoded values become dictionaries, lists, strings, numbers, booleans, and None in Python. A successful transport does not guarantee valid application data, so check the status code and validate the decoded shape before indexing nested fields. Think of a response as a parcel with both a delivery label and contents; inspect both. This challenge receives an already-decoded dictionary, guards status first, then filters active user records. Production code should also handle timeouts, invalid JSON, missing keys, and unexpected field types.",
    keyTerms: [
      { term: "API client", definition: "Code that sends requests to an API and interprets its responses." },
      { term: "JSON", definition: "A text format for exchanging structured values between systems." },
      { term: "Response body", definition: "The content carried by an HTTP response, separate from its status and headers." },
      { term: "Schema validation", definition: "Checking that decoded data has the required fields and value types." },
    ],
  },
  {
    explanation:
      "An API response has transport metadata and a body. Frameworks often serialize a Python dictionary into JSON, but only JSON-compatible values can cross that boundary: objects such as arbitrary class instances need conversion first. A stable response schema gives clients predictable keys and types. Status 200 means a successful general request, while 201 specifically signals that a resource was created. Think of the status as the envelope label and data as the letter inside. The challenge builds one consistent dictionary and uses a default parameter for the common 200 case while still allowing callers to supply another status.",
    keyTerms: [
      { term: "Response schema", definition: "The documented set of fields and types returned by an API." },
      { term: "Serialization", definition: "Converting in-memory values into a transport format such as JSON text." },
      { term: "HTTP 200", definition: "The status code for a request that completed successfully." },
      { term: "HTTP 201", definition: "The status code indicating that a request created a new resource." },
    ],
  },
  {
    explanation:
      "Routing and validation answer different questions. Routing asks whether a method-path pair has a handler; validation asks whether the matched request contains acceptable data. Keep that order clear so an unknown route returns 404, while bad input to a known route returns 400. POST commonly requests creation and 201 reports success. A non-empty string is truthy, but production validation may also strip whitespace and enforce length or character rules. Picture a building receptionist who first sends you to the right office, then that office checks your form. The challenge follows this sequence and returns consistent error shapes for both failure classes.",
    keyTerms: [
      { term: "Router", definition: "A component that selects a handler from an HTTP method and path." },
      { term: "Payload", definition: "The request data sent to an endpoint, often encoded as JSON." },
      { term: "HTTP 400", definition: "A status code indicating that the client's request data is invalid." },
      { term: "HTTP 404", definition: "A status code indicating that the requested route or resource was not found." },
    ],
  },
  {
    explanation:
      "A robust endpoint treats input as untrusted data, validates its outer shape, validates each nested item, performs the calculation, and only then builds a response. Early returns keep invalid states out of the main path. For an order, check that items is a non-empty list and that every record has usable name, price, and quantity fields before multiplying. Remember that JSON numbers do not distinguish every business rule, and floating-point arithmetic may be unsuitable for real currency; production systems often use decimal or integer cents. This final challenge combines the course's loops, dictionaries, types, aggregation, and response contracts without exposing a partial result.",
    keyTerms: [
      { term: "Untrusted input", definition: "Data from outside the program that must be checked before use." },
      { term: "Nested validation", definition: "Checking both a container and every structured value inside it." },
      { term: "Early return", definition: "Exiting a function as soon as a result or invalid condition is known." },
      { term: "Response contract", definition: "The promised status, fields, and value types an endpoint returns." },
    ],
  },
];

export function getLessonTeachingContent(dayNumber: number): LessonTeachingContent {
  const content = lessonTeachingContent[dayNumber - 1];
  if (content === undefined) {
    throw new Error(`Missing teaching content for day ${dayNumber}`);
  }
  return content;
}
