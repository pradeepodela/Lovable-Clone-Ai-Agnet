from langchain_groq import ChatGroq
from states import *
from prompts import *
from langgraph.graph import END
from langgraph.graph import StateGraph
from tools import *
from langgraph.prebuilt import create_react_agent

llm = ChatGroq(model_name="openai/gpt-oss-120b", api_key="")


def plannerAgent(state: dict)->dict:
    response = llm.with_structured_output(Plan).invoke(plan_prompt(state["user_prompt"]))
    if response is None:
        raise ValueError("Planner agent failed to generate a valid response for Planner Agent")
    # Return a dict so LangGraph can merge it into the state
    return {"plan": response}


def architectAgent(state: dict)->dict:
    plan = state["plan"]
    # Convert Plan object to string for the prompt
    plan_str = plan.model_dump_json(indent=2) if hasattr(plan, 'model_dump_json') else str(plan)
    response = llm.with_structured_output(TaskPlan).invoke(architect_prompt(plan_str))
    if response is None:
        raise ValueError("Architect agent failed to generate a valid response for Architect Agent")
    return {"task_plan": response, "plan": plan}

def coderAgent(state: dict)->dict:
    coder_state: CoderState = state.get("coder_state")
    if coder_state is None:
        coder_state = CoderState(task_plan=state["task_plan"], current_step_idx=0)
    
    steps = coder_state.task_plan.implementation_steps
    current_step_index = coder_state.current_step_idx
    if current_step_index >= len(steps):
        return {"coder_state": coder_state,"status":"DONE"}
   

    current_task = steps[current_step_index]
    # StructuredTool objects must be invoked with .invoke(), not called directly
    existing_content = read_file.invoke({"path": current_task.filepath})
    user_prompt = (
        f"Task: {current_task.task_description}\n"
        f"File: {current_task.filepath}\n"
        f"Existing content:\n{existing_content}\n"
        "Use write_file(path, content) to save your changes."
    )
    system_prompt = coder_system_prompt()
    code_tools = [read_file, write_file, list_files, get_current_directory]
    coder_agent = create_react_agent(llm, code_tools)
    # Use the agent with tools - don't call llm.invoke() directly as it doesn't have tools bound
    result = coder_agent.invoke({"messages": [{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}]})
    if result is None:
        raise ValueError("Coder agent failed to generate a valid response for Coder Agent")
    coder_state.current_step_idx += 1
    return {"coder_state": coder_state}
    
state = {
    "user_prompt": "Create a simple claculator web app",
    "plan": None
}

graph = StateGraph(dict)
graph.add_node("plan", plannerAgent)
graph.add_node("architect", architectAgent)
graph.add_node("coder", coderAgent)

graph.set_entry_point("plan")


graph.add_edge("plan", "architect")
graph.add_edge("architect", "coder")
graph.add_conditional_edges(
    "coder",
    lambda s: "END" if s.get("status") == "DONE" else "coder",
    {"END": END, "coder": "coder"}
)

agent = graph.compile()

user_prompt = "Create a simple claculator web app"

result = agent.invoke({"user_prompt": user_prompt})

print(result)