# This files contains your custom actions which can be used to run
# custom Python code.
#
# See this guide on how to implement these action:
# https://rasa.com/docs/rasa/custom-actions


# This is a simple example for a custom action which utters "Hello World!"

from typing import Any, Text, Dict, List

from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet, ActiveLoop, AllSlotsReset, FollowupAction
import json
import os
import difflib
from actions.form_filling_code.pdf_form import PDFFormFiller


class ActionAskDynamicQuestions(Action):
    def name(self) -> str:
        return "action_ask_dynamic_questions"

    def read_json(self, file_path):
        with open(file_path, "r") as file:
            return json.load(file)
        
    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: dict):
        # Path to the JSON file to store state
        form_name_final = tracker.get_slot("identified_form_name")
        response_list = tracker.get_slot("response_list")
        if response_list:
            state = response_list[0]
        else:
            state = {
                "questions": self.read_json(f"/app/actions/form_feilds_mapping_v2/{form_name_final}.json"),
                "current_index": 0,
                "responses": {}
            }
        
        def get_questions(state_questions):
            return list(state_questions.keys())
        
        def get_next_question(state, questions, current_index):
            if current_index < len(questions):
                next_question = questions[current_index]
                if 'skip' in state['questions'][next_question] and state['questions'][next_question]['skip']:
                    current_index += 1
                    return get_next_question(state, questions, current_index)
                if state['questions'][next_question]["Type"] == "autofill":
                    state = PDFFormFiller(email=tracker.sender_id).autofill_question(state, state['questions'][next_question], next_question)
                    current_index += 1
                    print(tracker.sender_id)
                    return get_next_question(state, questions, current_index)
            else:
                return None, state, current_index
            return next_question, state, current_index
        
        # Get current index and questions
        current_index = state["current_index"]
        questions = get_questions(state["questions"])

        # Save the user's latest response if it's not the initial call
        if tracker.latest_message.get("text") and current_index > 0 and tracker.latest_message.get("text")!="Skip Question":
            # Append the latest response to the responses list
            form_feild, add_questions = PDFFormFiller().get_form_feild(state['questions'][questions[current_index-1]])
            state, form_name_change = PDFFormFiller().fill_response(state, form_feild, add_questions, tracker.latest_message["text"])
            if form_name_change:
                form_name_final = form_name_change
                
            if add_questions:
                questions = get_questions(state["questions"])
        # Check if there are more questions to ask
        if current_index < len(questions):
            # Ask the next question
            next_question, state, current_index = get_next_question(state, questions, current_index)
            print("next_question", next_question)
            if next_question == "last_question":
                pdf_path = f'/app/actions/form_feilds_NAVAR/{form_name_final}.pdf'
                output_path = f"/app/actions/form_feilds_mapping/{form_name_final}_filled.pdf"
                feild_values = state["responses"]
                href = PDFFormFiller().fill_pdf(pdf_path, output_path, feild_values)
                dispatcher.utter_message(text="Thank you for answering all the questions!")
                dispatcher.utter_message(json_message={"type":"download_file","href":href})
                state['responses'] = {}
                del state['questions']['last_question']
                questions = get_questions(state["questions"])
                next_question, state, current_index = get_next_question(state, questions, current_index)

            if next_question:
                extra_question = PDFFormFiller().get_extra_question(state['questions'][questions[current_index]])
                if 'date' in next_question.lower() or 'offered on' in next_question.lower() or 'made on' in next_question.lower():
                    dispatcher.utter_message(json_message={"data_type":"date","text":next_question})
                else:
                    dispatcher.utter_message(json_message={"data_type":"char","text":next_question})
                if extra_question:
                    dispatcher.utter_message(json_message={"type":"select_options","payload":[{"title": i} for i in extra_question]})
                # Increment the current index
                state["current_index"] = current_index + 1
                # Save the updated state back to the JSON file
                return [ActiveLoop('action_ask_dynamic_questions'), SlotSet("response_list", state), SlotSet("identified_form_name", form_name_final)]
            else:
                # All questions have been asked
                pdf_path = f'/app/actions/form_feilds_NAVAR/{form_name_final}.pdf'
                output_path = f"/app/actions/form_feilds_mapping/{form_name_final}_filled.pdf"
                feild_values = state["responses"]
                href = PDFFormFiller().fill_pdf(pdf_path, output_path, feild_values)
                dispatcher.utter_message(text="Thank you for answering all the questions!")
                dispatcher.utter_message(json_message={"type":"download_file","href":href})
                return [ActiveLoop(None),AllSlotsReset()]
        else:
            if state['responses']:
                # All questions have been asked
                pdf_path = f'/app/actions/form_feilds_NAVAR/{form_name_final}.pdf'
                output_path = f"/app/actions/form_feilds_mapping/{form_name_final}_filled.pdf"
                feild_values = state["responses"]
                href = PDFFormFiller().fill_pdf(pdf_path, output_path, feild_values)
                dispatcher.utter_message(text="Thank you for answering all the questions!")
                dispatcher.utter_message(json_message={"type":"download_file","href":href})
            else:
                dispatcher.utter_message(text="You have answered all the questions.")
            return [ActiveLoop(None),AllSlotsReset()]


class SayFormName(Action):
    def name(self) -> Text:
        return "say_form_name"

    def find_closest_form(self, user_input, form_names):
        """
        Matches the user's input to the closest form name in the list.
        
        :param user_input: String input from the user.
        :param form_names: List of form names to match against.
        :return: Closest form name.
        """
        closest_match = difflib.get_close_matches(user_input, form_names, n=1, cutoff=0.5)
        return closest_match[0] if closest_match else None
    
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        form_name = tracker.get_slot("form_name2")
        if form_name:
            final_form_name = self.find_closest_form(form_name, [i[:-5] for i in list(os.listdir("/app/actions/form_feilds_mapping_v2"))])
            dispatcher.utter_message(text=f"Do you want to fill {final_form_name}")
        else:
            dispatcher.utter_message(text="I don't know which form you're filling out!")
        
        return [SlotSet("identified_form_name", final_form_name)]
    
class All_reset(Action):
    def name(self) -> Text:
        return "all_reset"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        return [AllSlotsReset()]
    
class ActionTriggerAction(Action):
    def name(self) -> Text:
        return "action_trigger_action"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        # Extract the parameter
        param = tracker.get_slot('param')
        dispatcher.utter_message(text=f"The parameter received is: {param}")
        tracker.slots["identified_form_name"] = param
        # Add your logic here
        return [FollowupAction('action_ask_dynamic_questions'),
                SlotSet("identified_form_name", param)]
