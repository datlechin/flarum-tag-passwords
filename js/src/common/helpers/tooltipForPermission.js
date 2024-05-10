import Tooltip from 'flarum/common/components/Tooltip';
import tagsLabel from './tagsLabel';
import icon from 'flarum/common/helpers/icon';

export default function tooltipForPermission(discussion, className, title, tooltip, isPasswordProtected, isGroupProtected, tags = discussion.tags()) {
  return (
    <Tooltip text={tooltip} position="bottom">
      <div className={className + '-main'}>
        <h2 className={className + '-title'}>
          {isPasswordProtected ? icon('fas fa-lock') : <></>}
          {isGroupProtected ? icon('fas fa-user-lock') : <></>}
          {' ' + title}
        </h2>
        {tagsLabel(tags, {}, true, false)}
        <ul class={className + '-info'}>
          <li class="item-tags">{tagsLabel(tags, {}, false)}</li>
        </ul>
      </div>
    </Tooltip>
  );
}
