import * as yup from 'yup';

export const authorValidationSchema = yup.object({
    name: yup.string()
        .required('Name is required')
        .min(2, 'Name must be at least 2 characters')
        .test('not-only-spaces', 'Name must consist of at least 2 non-space characters', value => value !== undefined && value.trim().length >= 2)
        .matches(/^[a-zA-ZąčęėįšųūžĄČĘĖĮŠŲŪŽ\s]*$/, 'Name cannot contain numbers or special symbols')
        .max(50, 'Name cannot be more than 50 characters'),
    surname: yup.string()
        .required('Surname is required')
        .min(2, 'Surname must be at least 2 characters')
        .test('not-only-spaces', 'Surname must consist of at least 2 non-space characters', value => value !== undefined && value.trim().length >= 2)
        .matches(/^[a-zA-ZąčęėįšųūžĄČĘĖĮŠŲŪŽ\s]*$/, 'Name cannot contain numbers or special symbols')
        .max(50, 'Surname cannot be more than 50 characters')
});