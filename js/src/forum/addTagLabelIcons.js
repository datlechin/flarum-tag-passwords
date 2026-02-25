import { extend } from 'flarum/common/extend';
import Icon from 'flarum/common/components/Icon';

export default function addTagLabelIcons() {
  // Add lock/unlock icons to TagLinkButton in sidebar
  extend('ext:flarum/tags/forum/components/TagLinkButton', 'view', function (vdom) {
    const tag = this.attrs.model;

    if (tag.isPasswordProtected()) {
      amendTagLinkButton(vdom, tag, <Icon name="fas fa-lock" />);
    }
    if (tag.isGroupProtected()) {
      amendTagLinkButton(vdom, tag, <Icon name="fas fa-user-lock" />);
    }
  });
}

function amendTagLinkButton(vdom, tag, lockIcon) {
  if (tag.isUnlocked()) {
    if (tag.isLockedIconDisplayed()) {
      vdom.children.push(<Icon name="fas fa-unlock" />);
    }
  } else if (tag.isProtectedTagDisplayedForSidebar()) {
    vdom.children.push(lockIcon);
  } else {
    vdom.attrs.className += ' hiddenTag';
  }
}
