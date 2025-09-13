import {ConfirmModal} from "#components";

export default function () {
    const overlay = useOverlay();
    return overlay.create(ConfirmModal)
}