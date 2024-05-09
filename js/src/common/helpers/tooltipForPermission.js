import Tooltip from 'flarum/common/components/Tooltip';
import tagsLabel from './tagsLabel';
import icon from 'flarum/common/helpers/icon';

export default function tooltipForPermission(discussion, title, tooltip, isPasswordProtected, isGroupProtected, tags = discussion.tags()) {

  return <Tooltip text={tooltip} position="bottom">
    <div className="DiscussionListItem-main">
      <h2 className="DiscussionListItem-title">
        {isPasswordProtected ? icon('fas fa-lock'): <></>}
        {isGroupProtected? icon('fas fa-user-lock'): <></>}
        {' '+title}
      </h2>
      {tagsLabel(tags, {}, true, false)}
      <ul class="DiscussionListItem-info"><li class="item-tags">
        {tagsLabel(tags, {}, false)}
      </li></ul>
    </div>
  </Tooltip>
}
