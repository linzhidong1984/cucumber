import { IAttachmentProps, ImageAttachment } from '../gherkin/Attachment'
import MessageToComponentMappingContext from '../../contexts/MessageToComponentMappingContext'
import React from 'react'

const CustomizableImageAttachment: React.FunctionComponent<IAttachmentProps> = ({
  attachment,
}) => {
  const messageToComponent = React.useContext(MessageToComponentMappingContext)
  const AttachmentComponent =
    messageToComponent?.imageAttachment ?? ImageAttachment

  return <AttachmentComponent attachment={attachment} />
}

export default CustomizableImageAttachment