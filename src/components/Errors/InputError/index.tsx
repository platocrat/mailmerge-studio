type InputErrorProps = {
  conditional: boolean
  errorText: string
}


const InputError = ({ conditional, errorText }) => {
  return (
    <>
      {
        conditional ? (
          <>
            <p
              style={ {
                bottom: '4px',
                color: 'red',
                fontSize: '14px',
                textAlign: 'center',
                position: 'relative',
              } }
            >
              { errorText }
            </p>
          </>
        ) : null
      }
    </>
  )
}


export default InputError