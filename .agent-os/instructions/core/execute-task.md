---
description: Rules to execute a task and its sub-tasks using Agent OS
globs:
alwaysApply: false
version: 1.0
encoding: UTF-8
---

# Task Execution Rules

## Overview

Execute a specific task along with its sub-tasks systematically.

<pre_flight_check>
  EXECUTE: @.agent-os/instructions/meta/pre-flight.md
</pre_flight_check>


<process_flow>

<step number="1" name="task_understanding">

### Step 1: Task Understanding

Read and analyze the given parent task and all its sub-tasks from tasks.md to gain complete understanding of what needs to be built.

<task_analysis>
  <read_from_tasks_md>
    - Parent task description
    - All sub-task descriptions
    - Task dependencies
    - Expected outcomes
  </read_from_tasks_md>
</task_analysis>

<instructions>
  ACTION: Read the specific parent task and all its sub-tasks
  ANALYZE: Full scope of implementation required
  UNDERSTAND: Dependencies and expected deliverables
</instructions>

</step>

<step number="2" name="technical_spec_review">

### Step 2: Technical Specification Review

Search and extract relevant sections from technical-spec.md to understand the technical implementation approach for this task.

<selective_reading>
  <search_technical_spec>
    FIND sections in technical-spec.md related to:
    - Current task functionality
    - Implementation approach for this feature
    - Integration requirements
    - Performance criteria
  </search_technical_spec>
</selective_reading>

<instructions>
  ACTION: Search technical-spec.md for task-relevant sections
  EXTRACT: Only implementation details for current task
  SKIP: Unrelated technical specifications
  FOCUS: Technical approach for this specific feature
</instructions>

</step>

<step number="3" subagent="context-fetcher" name="best_practices_review">

### Step 3: Best Practices Review

Use the context-fetcher subagent to retrieve relevant sections from @.agent-os/standards/best-practices.md that apply to the current task's technology stack and feature type.

<selective_reading>
  <search_best_practices>
    FIND sections relevant to:
    - Task's technology stack
    - Feature type being implemented
    - Code organization patterns
  </search_best_practices>
</selective_reading>

<instructions>
  ACTION: Use context-fetcher subagent
  REQUEST: "Find best practices sections relevant to:
            - Task's technology stack: [CURRENT_TECH]
            - Feature type: [CURRENT_FEATURE_TYPE]
            - Code organization patterns"
  PROCESS: Returned best practices
  APPLY: Relevant patterns to implementation
</instructions>

</step>

<step number="4" subagent="context-fetcher" name="code_style_review">

### Step 4: Code Style Review

Use the context-fetcher subagent to retrieve relevant code style rules from @.agent-os/standards/code-style.md for the languages and file types being used in this task.

<selective_reading>
  <search_code_style>
    FIND style rules for:
    - Languages used in this task
    - File types being modified
    - Component patterns being implemented
  </search_code_style>
</selective_reading>

<instructions>
  ACTION: Use context-fetcher subagent
  REQUEST: "Find code style rules for:
            - Languages: [LANGUAGES_IN_TASK]
            - File types: [FILE_TYPES_BEING_MODIFIED]
            - Component patterns: [PATTERNS_BEING_IMPLEMENTED]"
  PROCESS: Returned style rules
  APPLY: Relevant formatting and patterns
</instructions>

</step>

<step number="5" name="library_documentation_fetch">

### Step 5: Fetch Library Documentation and Verify Versions (Conditional)

If the task requires using external libraries, frameworks, or APIs, use Context7 MCP to fetch up-to-date documentation and verify you're using the latest stable version.

<when_to_use>
  IF task involves:
    - New library or framework not used in project before
    - Unfamiliar API or service integration
    - Specific library features or patterns needed
    - Version-specific functionality
    - Existing library with potential version upgrade
  THEN:
    Fetch documentation via Context7 MCP
  ELSE:
    SKIP this step
</when_to_use>

<library_identification>
  FROM technical-spec.md and task requirements:
    - Identify specific libraries needed
    - Determine which features/APIs will be used
    - Check tech-stack.md for library versions
    - Compare with latest available versions
</library_identification>

<instructions>
  ACTION: Identify libraries needed for this task
  IF library documentation needed:
    1. Use mcp__mcp-server-context7__resolve-library-id
       - Search for library name from tech-stack.md or requirements
       - Note available versions
    2. Use mcp__mcp-server-context7__get-library-docs
       - Provide Context7-compatible library ID
       - DO NOT specify version to get latest stable
       - Specify topic (e.g., "authentication", "routing", "hooks", "getting started")
       - Extract current stable version from docs
    3. Compare versions:
       - Check tech-stack.md or package.json for installed version
       - If newer stable version available, note upgrade opportunity
       - Check for breaking changes between versions
    4. Review returned documentation
    5. Apply patterns and best practices from latest docs
  ELSE:
    Proceed to next step
</instructions>

<version_handling>
  IF latest version differs from project version:
    - Use patterns compatible with installed version
    - Note in implementation comments if newer patterns exist
    - Consider backward compatibility
  IF using latest version:
    - Use most current patterns and best practices
    - Implement with latest API conventions
</version_handling>

<examples>
  <example_1>
    Task: Implement user authentication with NestJS Passport
    → resolve-library-id: "nestjs passport"
    → get-library-docs: libraryID="/nestjs/passport", topic="jwt authentication"
    → Extract version: "10.0.3"
    → Check project: Currently using "9.4.0"
    → Use patterns compatible with 9.4.0, note upgrade path
  </example_1>
  <example_2>
    Task: Create React form with validation
    → resolve-library-id: "react hook form"
    → get-library-docs: libraryID="/react-hook-form/react-hook-form", topic="validation"
    → Extract version: "7.50.0"
    → Check project: Using latest "7.50.0"
    → Use latest patterns and API
  </example_2>
  <example_3>
    Task: Implement Telegram bot handlers
    → resolve-library-id: "grammy"
    → get-library-docs: libraryID="/grammyjs/grammy", topic="message handlers"
    → Extract version: "1.21.1"
    → New library, install latest version
    → Use current best practices
  </example_3>
</examples>

</step>

<step number="6" name="task_execution">

### Step 6: Task and Sub-task Execution

Execute the parent task and all sub-tasks in order, implementing functionality according to requirements.

<execution_order>
  FOR each sub-task in order:
    - Implement the specific functionality
    - Follow code style and best practices
    - Use library patterns from Context7 docs (if fetched)
    - Ensure code quality and maintainability
    - Mark sub-task complete when finished
</execution_order>

<instructions>
  ACTION: Execute sub-tasks in their defined order
  IMPLEMENT: Each sub-task according to requirements
  FOLLOW: Best practices, code style guidelines, and library documentation
  UPDATE: Mark each sub-task complete as finished
</instructions>

</step>

<step number="7" subagent="file-creator" name="manual_testing_instructions">

### Step 7: Generate Manual Testing Instructions

Use the file-creator subagent to create a manual testing guide for this specific task in the spec's folder.

<file_location>
  .agent-os/specs/[SPEC_FOLDER]/manual-testing.md
</file_location>

<testing_guide_structure>
  <task_section>
    ## Testing: [PARENT_TASK_NAME]
    
    ### Overview
    [Brief description of what this task implements]
    
    ### Prerequisites
    - [Any setup required before testing]
    - [Dependencies that need to be running]
    - [Required test data or accounts]
    
    ### Test Scenarios
    
    #### Scenario 1: [Primary Happy Path]
    **Steps:**
    1. [Step-by-step instructions]
    2. [Be specific with UI elements, URLs, inputs]
    3. [Include expected behavior at each step]
    
    **Expected Result:**
    - [What should happen]
    - [Specific UI changes, messages, data]
    
    #### Scenario 2: [Edge Case or Alternative Flow]
    **Steps:**
    1. [Detailed steps]
    
    **Expected Result:**
    - [Expected behavior]
    
    #### Scenario 3: [Error Handling]
    **Steps:**
    1. [How to trigger error condition]
    
    **Expected Result:**
    - [Expected error message or behavior]
    
    ### Verification Checklist
    - [ ] [Specific functionality works as intended]
    - [ ] [UI elements display correctly]
    - [ ] [Data persists correctly]
    - [ ] [Error messages are clear and helpful]
    - [ ] [Responsive design works on mobile/tablet]
  </task_section>
</testing_guide_structure>

<instructions>
  ACTION: Use file-creator subagent
  REQUEST: "Create or append to manual-testing.md:
            - Location: [SPEC_FOLDER]/manual-testing.md
            - Add section for current parent task
            - Include 3-5 test scenarios covering:
              * Happy path (primary user flow)
              * Edge cases
              * Error handling
            - Provide specific, actionable steps
            - Include expected results for each scenario
            - Add verification checklist"
  ENSURE: Instructions are clear enough for non-technical testers
  INCLUDE: Specific URLs, button names, input values
  FORMAT: Use markdown with clear headings and checkboxes
</instructions>

<append_behavior>
  IF manual-testing.md already exists:
    APPEND new task section to existing file
  ELSE:
    CREATE new file with header and task section
</append_behavior>

</step>

<step number="8" name="task_status_updates">

### Step 8: Mark this task and sub-tasks complete

IMPORTANT: In the tasks.md file, mark this task and its sub-tasks complete by updating each task checkbox to [x].

<update_format>
  <completed>- [x] Task description</completed>
  <incomplete>- [ ] Task description</incomplete>
  <blocked>
    - [ ] Task description
    ⚠️ Blocking issue: [DESCRIPTION]
  </blocked>
</update_format>

<blocking_criteria>
  <attempts>maximum 3 different approaches</attempts>
  <action>document blocking issue</action>
  <emoji>⚠️</emoji>
</blocking_criteria>

<instructions>
  ACTION: Update tasks.md after each task completion
  MARK: [x] for completed items immediately
  DOCUMENT: Blocking issues with ⚠️ emoji
  LIMIT: 3 attempts before marking as blocked
</instructions>

</step>

</process_flow>

<post_flight_check>
  EXECUTE: @.agent-os/instructions/meta/post-flight.md
</post_flight_check>
