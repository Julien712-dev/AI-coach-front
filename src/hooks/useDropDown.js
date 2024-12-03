import { useState } from 'react';

export default function useDropDown(initialValue) {
    const [value, setValue] = useState(initialValue);
    const [isShow, setIsShow] = useState(false);

    const show = () => setIsShow(true);
    const hide = () => setIsShow(false);

    return [value, setValue, isShow, show, hide];
}