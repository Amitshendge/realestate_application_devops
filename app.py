import streamlit as st

# Set the title of the app
st.title("My My First Streamlit App")
# Add a header
st.header("Welcome to my app!")
# Add a subheader
st.subheader("This is a simple Streamlit application.")
# Add some text
st.text("Streamlit makes it easy to create web apps for data science.")




# Add a button
if st.button("Click me!"):
    st.write("Button clicked!")
# Add a checkbox
if st.checkbox("Check me!"):
    st.write("Checkbox checked!")
# Add a slider
slider_value = st.slider("Select a value", 0, 100, 50)
st.write(f"Slider value: {slider_value}")
# Add a selectbox
select_value = st.selectbox("Choose an option", ["Option 1", "Option 2", "Option 3"])
st.write(f"Selected option: {select_value}")
# Add a text input
text_input_value = st.text_input("Enter some text")
st.write(f"You entered: {text_input_value}")




