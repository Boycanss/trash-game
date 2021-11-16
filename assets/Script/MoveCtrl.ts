import {
  _decorator,
  Component,
  Node,
  systemEvent,
  SystemEventType,
  EventTouch,
  EventMouse,
  geometry,
  PhysicsSystem,
  Camera,
  CameraComponent,
  Vec2,
  TerrainCollider,
  Vec3,
  SkeletalAnimationComponent,
} from "cc";
const { ccclass, property } = _decorator;

const SPEED = 10;
const CELL_TIME = 0.016;

@ccclass("MoveCtrl")
export class MoveCtrl extends Component {
  @property(Node)
  node_role: Node = null!;

  @property({ type: CameraComponent })
  cameraCom: CameraComponent = null!;

  @property({ type: TerrainCollider })
  terrain: TerrainCollider = null!;

  @property({ type: SkeletalAnimationComponent })
  public CocosAnim: SkeletalAnimationComponent = null;

  private _touchPoint: Vec3 = null!;
  private _ray: geometry.ray = new geometry.Ray();
  private _isRunning: boolean = false;
  private _speed: number = 20;

  start() {
    this.setTouchPoint(this.node.position);
    systemEvent.on(SystemEventType.TOUCH_END, this.point, this);
    // this.CocosAnim = this.node_role.getComponent(SkeletalAnimationComponent);
  }

  setTouchPoint(point: Vec3) {
    this._touchPoint = point;
    console.log("touch x: ",this.fixPoint(point));
    
  }

  point(event: EventTouch, touch: Touch) {
    const { _touches }: any = touch;
    const { _point }: any = _touches[0];

    this.cameraCom.screenPointToRay(_point.x, _point.y, this._ray);

    if (PhysicsSystem.instance.raycast(this._ray)) {
      const r = PhysicsSystem.instance.raycastResults;
      for (let i = 0; i < r.length; i++) {
        const item = r[i];
        //check if the raycast hit the terrain or not.
        if (item.collider.uuid == this.terrain.uuid) {
          this.setTouchPoint(item.hitPoint);
          // this.CocosAnim.play('cocos_anim_run');
        }
      }
    }
  }

  move(dt: number) {
    if (this._isRunning) {
      this.node.setPosition(
        this.node.position.add3f(
          this._touchPoint.x*dt,
          0,
          this._touchPoint.z*dt
        )
      );
    } else {
      this.node.setPosition(
        this.node.position.add3f(
          0,
          0,
          0
        )
      );
    }
  }

  stop() {
    // this._touchPoint = null;
  }

  fixPoint(point:Vec3){
    return {x: parseFloat((Math.round(point.x * 100)/100).toFixed(1)), z: parseFloat((Math.round(point.z * 100)/100).toFixed(1))}
  }

  update(deltaTime: number) {
    this.move(deltaTime);
    console.log(this.fixPoint(this.node.position));
    
    if ((this.fixPoint(this.node.position)).x !== (this.fixPoint(this._touchPoint)).x) {
      this._isRunning = true;
    } else {
      if((this.fixPoint(this.node.position)).x == (this.fixPoint(this._touchPoint)).x){
        this._isRunning = false;}
      }
  }     
}

/**
 * [1] Class member could be defined like this.
 * [2] Use `property` decorator if your want the member to be serializable.
 * [3] Your initialization goes here.
 * [4] Your update function goes here.
 *
 * Learn more about scripting: https://docs.cocos.com/creator/3.0/manual/en/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.0/manual/en/scripting/ccclass.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.0/manual/en/scripting/life-cycle-callbacks.html
 */
