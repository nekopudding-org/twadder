import { useEffect, useState } from 'react';
import styles from 'styles/css/SignUpForm.module.css'
import { baseURL, ins } from 'utils/fetch-api';
import StyledInput from '../StyledInput';
import { useDispatch, useSelector } from 'react-redux'
import { setToast } from 'app/toastSlice'
import axios from 'axios';

const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
const nameRegex = /^[a-zA-Z0-9]{1,16}$/;

function Step1({
  formData,
  handleDataChange,
  setFormData,
  changeStep
}) {
  const toast = useSelector(state => state.toast);
  const dispatch = useDispatch();
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const [maxDay,setMaxDay] = useState(31);

  const [enableChecks,setEnableChecks] = useState({ //enable regex input checking for name and email
    displayName: false,
    email: false
  })
  const toggleCheck = (key,bool) => {
    setEnableChecks(prev => { return ({
      ...prev,
      [key]:bool
    }) })
  }

  useEffect(() => {
    const day = getMaxDay();
    setMaxDay(day);
  },[formData])

  const getMaxDay = () => {
    const {day,month,year} = formData;
    // console.log(`day: ${day}; month: ${month}; year: ${year}`);
    const md = new Date(year || 2022, month || 1, 0).getDate();
    //clear formData day if overflowing max
    if (formData.day > md) {
      setFormData(prev => { return {...prev, day: 0}})
    }
    return md;
  }
  const inputsAreValid = () => {
    let valid = true;
    if (!nameIsValid()) valid = false;
    if (!emailIsValid()) valid = false;
    if (formData.month === 0 || formData.year === 0 || formData.day === 0) valid = false;
    return valid;
  }
  const nameIsValid = () => {
    return nameRegex.test(formData.displayName);
  }
  const emailIsValid = () => {
    return emailRegex.test(formData.email);
  }

  const submitForm = async (e)=> {
    e.preventDefault();

    try {
      const res = await ins({
        method: 'get',
        url: `${baseURL}/signup/verify?`,
        params: {email: formData.email}
      });
      const {msg} = res.data;
      if (msg) dispatch(setToast({update: !toast.update, msg: msg}));
      if (res.status === 200)
        changeStep(2);
    }catch(err) {
      dispatch(setToast({update: !toast.update, msg: err.response.data.msg || err.message}));
    }
  }

  return (
    <>
      <form className={styles.stepContainer}>
        <div>
          <div className={styles.stepTitle}>Create your account</div>

          <StyledInput
            name='displayName'
            label='Display Name'
            type='text'
            value={formData.displayName}
            onChange={handleDataChange}
            onBlur={()=>toggleCheck('displayName',true)}
            showError={enableChecks.displayName && !nameIsValid()}
            errorMsg = 'Display names can only contain alphanumeric characters, and must be between 1 and 16 characters.'
          />

          <StyledInput
            name='email'
            label='Email'
            type='email'
            value={formData.email}
            onChange={handleDataChange}
            onBlur={()=>toggleCheck('email',true)}
            showError={enableChecks.email && !emailIsValid()}
            errorMsg = 'Invalid email.'
          />

          <div className={`bodyHeader ${styles.subTitle}`}>Date of birth</div>
          <div className={styles.subBody}>This will not be shown publicly. Confirm your own age, even if this account is for a business, a pet, or something else.</div>
          <div className={styles.dateInputContainer}>
            <div className={`${styles.inputContainer} ${styles.birthday} ${styles.month}`}>
              <div className={`subText ${styles.label}`}>Month</div>
              <select id='monthSelect' name="month" className={styles.input} onChange={handleDataChange}>
                <option value={0}></option>
                {months.map((m,i) => 
                  <option key={m} value={i+1}>{m}</option>
                )}
              </select>
            </div>
            <div className={`${styles.inputContainer} ${styles.birthday} ${styles.day}`}>
              <div className={`subText ${styles.label}`}>Day</div>
              <select id='daySelect' name="day" className={styles.input} onChange={handleDataChange}>
                <option value={0}></option>
                {
                  [...Array(maxDay)].map((_,i) => <option key={i} value={i+1}>{i+1}</option>)
                }
              </select>
            </div>
            <div className={`${styles.inputContainer} ${styles.birthday} ${styles.year}`}>
              <div className={`subText ${styles.label}`}>Year</div>
              <select id='yearSelect' name="year" className={styles.input} onChange={handleDataChange}>
                <option value={0}></option>
                {
                  [...Array.from({length: 100}, (_, i) => new Date().getFullYear() - i)]
                    .map((y,i) => <option key={i} value={y}>{y}</option>)
                }
              </select>
            </div>
          </div>
          <input type="checkbox" name="enableNotifications" className={styles.checkbox} onChange={handleDataChange}/>
          <div className={styles.enableNotifText}>Turn on notifications</div>
      </div>
        
        <div className={styles.buttonContainer}>
          <button className={`sidebarButton ${styles.nextButton}`} onClick={submitForm} disabled={!inputsAreValid()}>Next</button>
        </div>
      </form>
      
    </>
  )
}

export default Step1;