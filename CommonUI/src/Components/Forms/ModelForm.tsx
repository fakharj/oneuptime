import React, { ReactElement, useState } from 'react';
import { FormikErrors } from 'formik';
import BaseModel from 'Common/Models/BaseModel';
import FormValues from './Types/FormValues';
import Fields from './Types/Fields';
import BasicModelForm from './BasicModelForm';
import { JSONArray, JSONObject, JSONObjectOrArray } from 'Common/Types/JSON';
import URL from 'Common/Types/API/URL';
import HTTPMethod from 'Common/Types/API/HTTPMethod';
import API from '../../Utils/API/API';
import HTTPResponse from 'Common/Types/API/HTTPResponse';
import Route from 'Common/Types/API/Route';
import BadDataException from 'Common/Types/Exception/BadDataException';
import { DASHBOARD_API_URL } from '../../Config';

export enum FormType {
    Create,
    Update
}

export interface ComponentProps<TBaseModel extends BaseModel> {
    model: TBaseModel;
    id: string;
    onValidate?: (
        values: FormValues<TBaseModel>
    ) => FormikErrors<FormValues<TBaseModel>>;
    fields: Fields<TBaseModel>;
    submitButtonText?: string;
    title?: string;
    description?: string;
    showAsColumns?: number;
    footer: ReactElement;
    onCancel?: () => void;
    onSuccess?: (data: TBaseModel | JSONObjectOrArray | Array<TBaseModel>) => void;
    cancelButtonText?: string;
    maxPrimaryButtonWidth?: boolean;
    apiUrl?: URL,
    formType: FormType
}

const CreateModelForm: Function = <TBaseModel extends BaseModel>(
    props: ComponentProps<TBaseModel>
): ReactElement => {
    const [isLoading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const onSubmit = async (values: any) => {
        // Ping an API here.
        setLoading(true);
        let apiUrl = props.apiUrl;

        if (!apiUrl) {
            const apiPath: Route | null = props.model.getCrudApiPath();
            if (!apiPath) {
                throw new BadDataException("This model does not support CRUD operations.");
            }

            apiUrl = DASHBOARD_API_URL.addRoute(apiPath);
        }

        const result: HTTPResponse<JSONObject | JSONArray | TBaseModel | Array<TBaseModel>> =
            await API.fetch<
                JSONObject |
                JSONArray |
                TBaseModel |
                Array<TBaseModel
                >>(props.formType === FormType.Create ? HTTPMethod.POST : HTTPMethod.PUT, apiUrl, values);

        setLoading(false);

        if (result.isSuccess()) {
            if (props.onSuccess) {
                props.onSuccess(result.data);
            }
        } else {
            setError((result.data as JSONObject)["error"] as string)
        }
    };

    return (
        <BasicModelForm<TBaseModel>
            title={props.title}
            description={props.description}
            model={props.model}
            id={props.id}
            fields={props.fields}
            showAsColumns={props.showAsColumns}
            footer={props.footer}
            isLoading={isLoading}
            submitButtonText={props.submitButtonText}
            cancelButtonText={props.cancelButtonText}
            onSubmit={onSubmit}
            onValidate={props.onValidate}
            onCancel={props.onCancel}
            maxPrimaryButtonWidth={props.maxPrimaryButtonWidth}
            error={error}
        ></BasicModelForm>
    );
};

export default CreateModelForm;
